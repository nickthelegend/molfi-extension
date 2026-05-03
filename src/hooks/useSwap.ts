import { useState, useCallback } from 'react';
import {
  createPublicClient,
  http,
  parseUnits,
  formatUnits,
  maxUint256,
} from 'viem';
import { polygon, base, arbitrum, mainnet } from 'viem/chains';
import { useAccount, useWalletClient } from 'wagmi';
import {
  UNISWAP_V3_CONTRACTS,
  FEE_TIERS,
  ERC20_ABI,
  QUOTER_V2_ABI,
  SWAP_ROUTER_ABI,
} from '../constants/SwapConfig';

const WRAPPED_TOKENS: Record<number, `0x${string}`> = {
  1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  137: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', // WMATIC
  8453: '0x4200000000000000000000000000000000000006', // WETH
  42161: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH
};

function wrapAddress(chainId: number, address: string): `0x${string}` {
  const addr = address.toLowerCase();
  if (addr === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' || addr === '0x0000000000000000000000000000000000000000') {
    return WRAPPED_TOKENS[chainId] || (address as `0x${string}`);
  }
  return address as `0x${string}`;
}


export type SwapStep = 'idle' | 'quoting' | 'checking_allowance' | 'approving' | 'waiting_approval' | 'signing_swap' | 'waiting_confirmation' | 'done' | 'error';

export type SwapQuote = {
  amountOut: bigint;
  amountOutFormatted: string;
  fee: number;
  priceImpact: string;
  gasEstimate: bigint;
  gasCostUSD: string;
};

export type SwapParams = {
  chainId: number;
  tokenIn: `0x${string}`;
  tokenOut: `0x${string}`;
  tokenInDecimals: number;
  tokenOutDecimals: number;
  amountIn: string;
  slippageBps?: number;
  recipientAddress?: `0x${string}`;
};

const clients: Record<number, any> = {
  137: createPublicClient({ chain: polygon, transport: http() }),
  8453: createPublicClient({ chain: base, transport: http() }),
  42161: createPublicClient({ chain: arbitrum, transport: http() }),
  1: createPublicClient({ chain: mainnet, transport: http() }),
};

async function getBestQuote(
  chainId: number,
  client: any,
  tokenIn: `0x${string}`,
  tokenOut: `0x${string}`,
  amountIn: bigint
) {
  const contracts = UNISWAP_V3_CONTRACTS[chainId];
  if (!contracts) return null;

  const tiers = [FEE_TIERS.MEDIUM, FEE_TIERS.LOW, FEE_TIERS.HIGH, FEE_TIERS.LOWEST];
  let best = null;

  for (const fee of tiers) {
    try {
      const result = await client.simulateContract({
        address: contracts.QUOTER_V2,
        abi: QUOTER_V2_ABI,
        functionName: 'quoteExactInputSingle',
        args: [{ tokenIn, tokenOut, amountIn, fee, sqrtPriceLimitX96: 0n }],
      });
      const [amountOut, , , gasEstimate] = result.result as [bigint, bigint, number, bigint];
      if (!best || amountOut > best.amountOut) {
        best = { amountOut, fee, gasEstimate };
      }
    } catch (e) {
      // Skip tier if pool doesn't exist
    }
  }
  return best;
}

export function useSwap() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [step, setStep] = useState<SwapStep>('idle');
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getQuote = useCallback(async (params: SwapParams) => {
    setStep('quoting');
    setError(null);
    try {
      const client = clients[params.chainId];
      if (!client) throw new Error("Chain not supported");

      const amountIn = parseUnits(String(params.amountIn), params.tokenInDecimals);
      const tokenIn = wrapAddress(params.chainId, params.tokenIn);
      const tokenOut = wrapAddress(params.chainId, params.tokenOut);
      
      const best = await getBestQuote(params.chainId, client, tokenIn, tokenOut, amountIn);
      
      if (!best) throw new Error(`No liquidity found for this pair on ${params.chainId === 8453 ? 'Base' : 'this chain'}. Try a different amount or token.`);

      const q: SwapQuote = {
        amountOut: best.amountOut,
        amountOutFormatted: formatUnits(best.amountOut, params.tokenOutDecimals),
        fee: best.fee,
        priceImpact: '<0.5%',
        gasEstimate: best.gasEstimate,
        gasCostUSD: '~$0.01',
      };
      setQuote(q);
      setStep('idle');
      return q;
    } catch (e: any) {
      setError(e.message);
      setStep('error');
      return null;
    }
  }, []);

  const executeSwap = useCallback(async (params: SwapParams) => {
    if (!address || !walletClient) {
      setError("Wallet not connected");
      return null;
    }
    setStep('quoting');
    try {
      const client = clients[params.chainId];
      const contracts = UNISWAP_V3_CONTRACTS[params.chainId];
      const amountIn = parseUnits(String(params.amountIn), params.tokenInDecimals);
      const tokenIn = wrapAddress(params.chainId, params.tokenIn);
      const tokenOut = wrapAddress(params.chainId, params.tokenOut);
      const isNativeIn = params.tokenIn.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' || params.tokenIn.toLowerCase() === '0x0000000000000000000000000000000000000000';

      const best = await getBestQuote(params.chainId, client, tokenIn, tokenOut, amountIn);
      if (!best) throw new Error("No route found");

      if (!isNativeIn) {
        setStep('checking_allowance');
        const allowance = await client.readContract({
          address: params.tokenIn,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [address, contracts.SWAP_ROUTER],
        }) as bigint;

        if (allowance < amountIn) {
          setStep('approving');
          const hash = await walletClient.writeContract({
            address: params.tokenIn,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [contracts.SWAP_ROUTER, maxUint256],
          });
          setStep('waiting_approval');
          await client.waitForTransactionReceipt({ hash });
        }
      }

      setStep('signing_swap');
      const slippage = params.slippageBps || 50;
      const amountOutMinimum = best.amountOut * BigInt(10000 - slippage) / 10000n;

      const hash = await walletClient.writeContract({
        address: contracts.SWAP_ROUTER,
        abi: SWAP_ROUTER_ABI,
        functionName: 'exactInputSingle',
        args: [{
          tokenIn: params.tokenIn,
          tokenOut: params.tokenOut,
          fee: best.fee,
          recipient: address,
          deadline: BigInt(Math.floor(Date.now() / 1000) + 1200),
          amountIn,
          amountOutMinimum,
          sqrtPriceLimitX96: 0n,
        }],
        value: isNativeIn ? amountIn : 0n,
      });

      setStep('waiting_confirmation');
      await client.waitForTransactionReceipt({ hash });
      setTxHash(hash);
      setStep('done');
      return hash;
    } catch (e: any) {
      setError(e.shortMessage || e.message);
      setStep('error');
      return null;
    }
  }, [address, walletClient]);

  const reset = () => { setStep('idle'); setQuote(null); setTxHash(null); setError(null); };

  return { step, quote, txHash, error, getQuote, executeSwap, reset };
}
