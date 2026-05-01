import { useState, useCallback } from 'react';
import {
  createPublicClient,
  createWalletClient,
  custom,
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
  16661: createPublicClient({ 
    chain: { id: 16661, name: '0G', nativeCurrency: { name: 'A0GI', symbol: 'A0GI', decimals: 18 }, rpcUrls: { default: { http: ['https://evmrpc.0g.ai'] }, public: { http: ['https://evmrpc.0g.ai'] } } }, 
    transport: http() 
  }),
};

export function useSwap() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [step, setStep] = useState<SwapStep>('idle');
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getQuote = useCallback(async (params: SwapParams) => {
    setStep('quoting');
    try {
      const client = clients[params.chainId];
      const amountIn = parseUnits(params.amountIn, params.tokenInDecimals);
      
      // Simplified: Try MEDIUM fee tier
      const result = await client.simulateContract({
        address: UNISWAP_V3_CONTRACTS.QUOTER_V2,
        abi: QUOTER_V2_ABI,
        functionName: 'quoteExactInputSingle',
        args: [{ tokenIn: params.tokenIn, tokenOut: params.tokenOut, amountIn, fee: FEE_TIERS.MEDIUM, sqrtPriceLimitX96: 0n }],
      });
      
      const [amountOut, , , gasEstimate] = result.result as [bigint, bigint, number, bigint];
      const q: SwapQuote = {
        amountOut,
        amountOutFormatted: formatUnits(amountOut, params.tokenOutDecimals),
        fee: FEE_TIERS.MEDIUM,
        priceImpact: '<0.5%',
        gasEstimate,
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
    if (!address || !walletClient) return null;
    setStep('signing_swap');
    try {
      const client = clients[params.chainId];
      const amountIn = parseUnits(params.amountIn, params.tokenInDecimals);
      const isNativeIn = params.tokenIn.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

      if (!isNativeIn) {
        setStep('checking_allowance');
        const allowance = await client.readContract({
          address: params.tokenIn,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [address, UNISWAP_V3_CONTRACTS.SWAP_ROUTER],
        });

        if ((allowance as bigint) < amountIn) {
          setStep('approving');
          const hash = await walletClient.writeContract({
            address: params.tokenIn,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [UNISWAP_V3_CONTRACTS.SWAP_ROUTER, maxUint256],
          });
          await client.waitForTransactionReceipt({ hash });
        }
      }

      setStep('signing_swap');
      const hash = await walletClient.writeContract({
        address: UNISWAP_V3_CONTRACTS.SWAP_ROUTER,
        abi: SWAP_ROUTER_ABI,
        functionName: 'exactInputSingle',
        args: [{
          tokenIn: params.tokenIn,
          tokenOut: params.tokenOut,
          fee: FEE_TIERS.MEDIUM,
          recipient: address,
          deadline: BigInt(Math.floor(Date.now() / 1000) + 1200),
          amountIn,
          amountOutMinimum: 0n,
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
      setError(e.message);
      setStep('error');
      return null;
    }
  }, [address, walletClient]);

  const reset = () => { setStep('idle'); setQuote(null); setTxHash(null); setError(null); };

  return { step, quote, txHash, error, getQuote, executeSwap, reset };
}
