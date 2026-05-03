import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { 
  Flashlight, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ChevronDown,
  Sparkles,
  GitBranch
} from 'lucide-react';
import { useSwap } from '../../hooks/useSwap';
import { motion, AnimatePresence } from 'framer-motion';

interface SwapCardProps {
  payload: {
    reasoning: string;
    plan: {
      intent: string;
      steps: Array<{
        action: 'swap' | 'send';
        params: any;
      }>;
      totalValueUsd: number;
    };
    riskAssessment: {
      verdict: 'AUTO_EXECUTE' | 'NEEDS_APPROVAL';
      reason: string;
    };
  };
}

const FALLBACK_ADDRESSES: Record<string, Record<string, string>> = {
  '1': {
    'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    'WETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
  '137': {
    'USDC': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    'WMATIC': '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    'USDT': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  },
  '8453': {
    'USDC': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    'WETH': '0x4200000000000000000000000000000000000006',
  },
  '42161': {
    'USDC': '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    'WETH': '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  },
};

const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  137: 'Polygon',
  8453: 'Base',
  42161: 'Arbitrum',
};

export const SwapCard: React.FC<SwapCardProps> = ({ payload }) => {
  const [fromChain, setFromChain] = useState<number>(1);
  const [toChain, setToChain] = useState<number>(1);

  const {
    getQuote, executeSwap, step, quote,
    txHash, error, reset
  } = useSwap();

  const swapStepData = payload.plan.steps.find(s => s.action === 'swap');
  const swapParams = swapStepData?.params;

  useEffect(() => {
    if (swapParams) {
      setFromChain(swapParams.fromChain || swapParams.chainId || 1);
      setToChain(swapParams.toChain || swapParams.fromChain || swapParams.chainId || 1);
    }
  }, [swapParams]);

  const fetchQuote = useCallback(() => {
    if (!swapParams) return;

    const tokenIn = (swapParams.tokenIn === "null" || !swapParams.tokenIn) ? null : swapParams.tokenIn;
    const tokenOut = (swapParams.tokenOut === "null" || !swapParams.tokenOut) ? null : swapParams.tokenOut;

    const fromTokenAddr = tokenIn || FALLBACK_ADDRESSES[String(fromChain)]?.[swapParams.symbolIn?.toUpperCase()];
    const toTokenAddr = tokenOut || FALLBACK_ADDRESSES[String(fromChain)]?.[swapParams.symbolOut?.toUpperCase()];
    
    if (!fromTokenAddr || !toTokenAddr) return;

    reset();
    getQuote({
      chainId: fromChain,
      tokenIn: fromTokenAddr as `0x${string}`,
      tokenOut: toTokenAddr as `0x${string}`,
      tokenInDecimals: swapParams.tokenInDecimals ?? 6,
      tokenOutDecimals: swapParams.tokenOutDecimals ?? 18,
      amountIn: swapParams.amount,
    });
  }, [swapParams, fromChain, getQuote, reset]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  const handleExecute = async () => {
    if (!swapParams || !quote) return;
    
    const tokenIn = (swapParams.tokenIn === "null" || !swapParams.tokenIn) ? null : swapParams.tokenIn;
    const tokenOut = (swapParams.tokenOut === "null" || !swapParams.tokenOut) ? null : swapParams.tokenOut;
    const fromTokenAddr = tokenIn || FALLBACK_ADDRESSES[String(fromChain)]?.[swapParams.symbolIn?.toUpperCase()];
    const toTokenAddr = tokenOut || FALLBACK_ADDRESSES[String(fromChain)]?.[swapParams.symbolOut?.toUpperCase()];

    await executeSwap({
      chainId: fromChain,
      tokenIn: fromTokenAddr as `0x${string}`,
      tokenOut: toTokenAddr as `0x${string}`,
      tokenInDecimals: swapParams.tokenInDecimals ?? 6,
      tokenOutDecimals: swapParams.tokenOutDecimals ?? 18,
      amountIn: swapParams.amount,
    });
  };

  const isLoading = step !== 'idle' && step !== 'done' && step !== 'error';

  return (
    <div className="bg-surface-container rounded-3xl p-6 border border-outline-variant/10 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <Flashlight size={14} className="text-primary" />
          <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Swap Intent</span>
        </div>
        <span className="text-[10px] font-black text-primary">MOLFI AI</span>
      </div>

      {/* Asset Display */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest">Sell</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{swapParams?.amount}</span>
            <span className="text-sm font-bold text-primary">{swapParams?.symbolIn}</span>
          </div>
        </div>

        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
          <ArrowRight size={18} className="text-primary" />
        </div>

        <div className="flex flex-col gap-1 items-end">
          <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest">Receive</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {isLoading ? '...' : (quote ? Number(quote.amountOutFormatted).toFixed(4) : '?')}
            </span>
            <span className="text-sm font-bold text-primary">{swapParams?.symbolOut}</span>
          </div>
        </div>
      </div>

      {/* Logic / Reasoning */}
      <div className="bg-black/20 rounded-2xl p-4 border border-outline-variant/5 mb-6 relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={10} className="text-primary" />
          <span className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest">AI Reasoning</span>
        </div>
        <p className="text-[11px] font-bold text-on-surface-variant leading-relaxed">
          {payload.reasoning}
        </p>
      </div>

      {/* Network Selector */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest">Network</span>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-[10px] font-black text-white uppercase tracking-tight">{CHAIN_NAMES[fromChain]}</span>
          <ChevronDown size={10} className="text-on-surface-variant" />
        </div>
      </div>

      {/* Error / Success */}
      {error && (
        <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-6 relative z-10">
          <AlertCircle size={14} className="text-red-500 shrink-0" />
          <span className="text-[10px] font-bold text-red-500">{error}</span>
        </div>
      )}

      {step === 'done' ? (
        <div className="flex items-center justify-center gap-3 py-4 bg-green-500/10 border border-green-500/20 rounded-2xl relative z-10">
          <CheckCircle2 size={20} className="text-green-500" />
          <span className="text-xs font-black text-green-500 uppercase tracking-widest">Transaction Confirmed</span>
        </div>
      ) : (
        <button
          onClick={handleExecute}
          disabled={!quote || isLoading}
          className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all relative z-10 ${
            !quote || isLoading 
              ? 'bg-white/5 text-on-surface-variant cursor-not-allowed' 
              : 'bg-white text-black hover:bg-primary hover:text-white shadow-xl shadow-black/20 active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <GitBranch size={16} />
              <span>Execute Swap Intent</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
