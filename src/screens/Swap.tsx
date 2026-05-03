import { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import { useSwap } from '../hooks/useSwap';

const TOKENS = [
  { symbol: 'A0GI', name: '0G Native', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, icon: '/logo.png' },
  { symbol: 'USDC', name: 'USD Coin', address: '0x627d32C41D35284050b168925501867160965383', decimals: 6, icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
  { symbol: 'ETH', name: 'Ethereum', address: '0x0000000000000000000000000000000000000000', decimals: 18, icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
];

const STEP_LABELS: Record<string, string> = {
  idle: 'Swap',
  quoting: 'Fetching route...',
  checking_allowance: 'Checking allowance...',
  approving: 'Approve in wallet',
  waiting_approval: 'Confirming approval...',
  signing_swap: 'Sign swap in wallet',
  waiting_confirmation: 'Broadcasting...',
  done: 'Swap Complete ✓',
  error: 'Swap Failed',
};

export function Swap({ onBack }: { onBack: () => void }) {
  const { address } = useAccount();
  const [inputAmount, setInputAmount] = useState('');
  const [tokenIn, setTokenIn] = useState(TOKENS[0]);
  const [tokenOut, setTokenOut] = useState(TOKENS[1]);
  const [isQuotingLocal, setIsQuotingLocal] = useState(false);

  const { getQuote, executeSwap, step, quote, error, reset } = useSwap();

  const { data: balanceIn } = useBalance({ 
    address, 
    token: (tokenIn.address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' || tokenIn.address === '0x0000000000000000000000000000000000000000' ? undefined : tokenIn.address) as any,
  } as any);

  console.log(`[Swap] Render. Address: ${address}, Step: ${step}, Input: ${inputAmount}`);
  console.log(`[Swap] Pair: ${tokenIn.symbol} -> ${tokenOut.symbol}`);

  useEffect(() => {
    console.log(`[Swap] Quote Effect. Amount: ${inputAmount}`);
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      console.log('[Swap] Resetting quote');
      reset();
      return;
    }

    const timer = setTimeout(async () => {
      console.log(`[Swap] Fetching quote for ${inputAmount} ${tokenIn.symbol} -> ${tokenOut.symbol}`);
      setIsQuotingLocal(true);
      await getQuote({
        chainId: 16661, 
        tokenIn: tokenIn.address as `0x${string}`,
        tokenOut: tokenOut.address as `0x${string}`,
        tokenInDecimals: tokenIn.decimals,
        tokenOutDecimals: tokenOut.decimals,
        amountIn: inputAmount,
      });
      setIsQuotingLocal(false);
      console.log('[Swap] Quoting local finished');
    }, 600);

    return () => clearTimeout(timer);
  }, [inputAmount, tokenIn, tokenOut]);

  const handleSwap = async () => {
    console.log('[Swap] handleSwap called');
    if (!quote || step === 'done') {
      console.warn('[Swap] No quote or already done');
      return;
    }
    await executeSwap({
      chainId: 16661,
      tokenIn: tokenIn.address as `0x${string}`,
      tokenOut: tokenOut.address as `0x${string}`,
      tokenInDecimals: tokenIn.decimals,
      tokenOutDecimals: tokenOut.decimals,
      amountIn: inputAmount,
    });
  };

  const isProcessing = step !== 'idle' && step !== 'error' && step !== 'done';

  return (
    <div className="w-full h-full flex flex-col p-4 gap-6 overflow-y-auto pb-20">
      <div className="flex items-center gap-4 pt-4">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black text-white uppercase tracking-tight">Swap</h1>
      </div>

      <div className="flex flex-col gap-2">
        <div className="bg-surface-container rounded-3xl p-5 border border-outline-variant/10">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">You Sell</span>
            <span className="text-[10px] font-bold text-on-surface-variant/60">
              Balance: {balanceIn ? parseFloat(formatUnits(balanceIn.value, balanceIn.decimals)).toFixed(4) : '0.0000'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <input type="number" placeholder="0" value={inputAmount} onChange={(e) => setInputAmount(e.target.value)} className="bg-transparent text-3xl font-black text-white placeholder:text-white/10 focus:outline-none w-full" />
            <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-2xl border border-outline-variant/10 transition-all shrink-0">
              <img src={tokenIn.icon} className="w-5 h-5 rounded-full" alt="" />
              <span className="text-xs font-black text-white">{tokenIn.symbol}</span>
              <ChevronDown size={14} className="text-on-surface-variant" />
            </button>
          </div>
        </div>

        <div className="flex justify-center -my-4 relative z-10">
          <button onClick={() => { const temp = tokenIn; setTokenIn(tokenOut); setTokenOut(temp); }} className="w-10 h-10 rounded-xl bg-[#1d1d1d] border-4 border-background flex items-center justify-center text-primary hover:scale-110 transition-all">
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="bg-surface-container rounded-3xl p-5 border border-outline-variant/10">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">You Buy</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="text-3xl font-black text-white flex-1 h-10 flex items-center">
              {isQuotingLocal ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : (quote ? parseFloat(quote.amountOutFormatted).toFixed(6) : <span className="text-white/10">0</span>)}
            </div>
            <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-2xl border border-outline-variant/10 transition-all shrink-0">
              <img src={tokenOut.icon} className="w-5 h-5 rounded-full" alt="" />
              <span className="text-xs font-black text-white">{tokenOut.symbol}</span>
              <ChevronDown size={14} className="text-on-surface-variant" />
            </button>
          </div>
        </div>
      </div>

      {quote && (
        <div className="flex flex-col gap-2 px-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Rate</span>
            <span className="text-[10px] font-black text-white">1 {tokenIn.symbol} = {(parseFloat(quote.amountOutFormatted)/parseFloat(inputAmount)).toFixed(4)} {tokenOut.symbol}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Gas Cost</span>
            <span className="text-[10px] font-black text-white">{quote.gasCostUSD}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400">
          <AlertCircle size={18} />
          <p className="text-[10px] font-bold uppercase tracking-wide leading-tight">{error}</p>
        </div>
      )}

      <button disabled={!quote || isProcessing || step === 'done'} onClick={handleSwap} className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${!quote || isProcessing || step === 'done' ? 'bg-white/5 text-on-surface-variant/20' : 'bg-primary text-black hover:bg-primary/90'}`}>
        {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
        {STEP_LABELS[step]}
      </button>
    </div>
  );
}
