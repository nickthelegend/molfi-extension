import { defineChain } from 'viem';

// ─── 0G Chain Definition ───────────────────────────────────────────────────
export const ogChain = defineChain({
  id: 16661,
  name: '0G Mainnet',
  nativeCurrency: { name: 'A0GI', symbol: 'A0GI', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://evmrpc.0g.ai'] },
    public: { http: ['https://evmrpc.0g.ai'] },
  },
  blockExplorers: {
    default: { name: '0G Explorer', url: 'https://chainscan.0g.ai' },
  },
});

export const UNISWAP_V3_CONTRACTS: Record<number, { SWAP_ROUTER: `0x${string}`, QUOTER_V2: `0x${string}` }> = {
  1: { // Ethereum
    SWAP_ROUTER: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
    QUOTER_V2:   '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
  },
  137: { // Polygon
    SWAP_ROUTER: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
    QUOTER_V2:   '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
  },
  8453: { // Base
    SWAP_ROUTER: '0x2626664c2603336E57B271c5C0b26F421741e481',
    QUOTER_V2:   '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a',
  },
  42161: { // Arbitrum
    SWAP_ROUTER: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
    QUOTER_V2:   '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
  }
};

export const FEE_TIERS = { LOWEST: 100, LOW: 500, MEDIUM: 3000, HIGH: 10000 } as const;

export const ERC20_ABI = [
  { name: 'approve', type: 'function', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable' },
  { name: 'allowance', type: 'function', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { name: 'decimals', type: 'function', inputs: [], outputs: [{ name: '', type: 'uint8' }], stateMutability: 'view' },
  { name: 'balanceOf', type: 'function', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { name: 'transfer', type: 'function', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable' },
] as const;

export const QUOTER_V2_ABI = [
  {
    name: 'quoteExactInputSingle',
    type: 'function',
    inputs: [{
      name: 'params',
      type: 'tuple',
      components: [
        { name: 'tokenIn',           type: 'address' },
        { name: 'tokenOut',          type: 'address' },
        { name: 'amountIn',          type: 'uint256' },
        { name: 'fee',               type: 'uint24'  },
        { name: 'sqrtPriceLimitX96', type: 'uint160' },
      ],
    }],
    outputs: [
      { name: 'amountOut',                type: 'uint256' },
      { name: 'sqrtPriceX96After',        type: 'uint160' },
      { name: 'initializedTicksCrossed',  type: 'uint32'  },
      { name: 'gasEstimate',              type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
] as const;

export const SWAP_ROUTER_ABI = [
  {
    name: 'exactInputSingle',
    type: 'function',
    inputs: [{
      name: 'params',
      type: 'tuple',
      components: [
        { name: 'tokenIn',           type: 'address' },
        { name: 'tokenOut',          type: 'address' },
        { name: 'fee',               type: 'uint24'  },
        { name: 'recipient',         type: 'address' },
        { name: 'deadline',          type: 'uint256' },
        { name: 'amountIn',          type: 'uint256' },
        { name: 'amountOutMinimum',  type: 'uint256' },
        { name: 'sqrtPriceLimitX96', type: 'uint160' },
      ],
    }],
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'payable',
  },
] as const;
