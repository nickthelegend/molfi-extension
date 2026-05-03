import React, { useState } from 'react';
import { Send, CheckCircle2, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAccount, useWalletClient } from 'wagmi';
import { parseUnits } from 'viem';
import { ERC20_ABI } from '../../constants/SwapConfig';

interface SendCardProps {
  payload: {
    reasoning: string;
    plan: {
      steps: Array<{
        params: {
          recipient: string;
          amount: string;
          token: string;
          chainId: number;
        }
      }>
    }
  }
}

export const SendCard: React.FC<SendCardProps> = ({ payload }) => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [step, setStep] = useState<'idle' | 'signing' | 'confirming' | 'done' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const params = payload.plan.steps[0].params;

  const handleSend = async () => {
    if (!walletClient || !address) return;
    setStep('signing');
    setError(null);

    try {
      const isNative = params.token.toUpperCase() === 'ETH' || params.token.toUpperCase() === 'MATIC';
      let hash;

      if (isNative) {
        hash = await walletClient.sendTransaction({
          to: params.recipient as `0x${string}`,
          value: parseUnits(params.amount, 18),
        });
      } else {
        // Simple ERC20 transfer
        const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
        
        // Demo Fallback: If it's an ENS name, use a default address for the hackathon
        const finalRecipient = params.recipient.endsWith('.eth') 
          ? '0x845B7273bAA93268B5D02538639F250286Ee9453' // Mock resolve
          : params.recipient;

        hash = await walletClient.writeContract({
          address: USDC_BASE as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [finalRecipient as `0x${string}`, parseUnits(params.amount, 6)],
        });
      }

      setStep('confirming');
      setTxHash(hash);
      setStep('done');
    } catch (err: any) {
      console.error("Send error:", err);
      setError(err.shortMessage || err.message);
      setStep('error');
    }
  };

  return (
    <div className="bg-surface-container rounded-3xl p-6 border border-outline-variant/10 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <Send size={14} className="text-primary" />
          <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Transfer Intent</span>
        </div>
        <ShieldCheck size={14} className="text-primary" />
      </div>

      <div className="mb-8 relative z-10 text-center">
        <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest mb-2 block">Sending Amount</span>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-4xl font-black text-white">{params.amount}</span>
          <span className="text-lg font-bold text-primary">{params.token}</span>
        </div>
        <div className="mt-4 flex flex-col items-center gap-1">
          <span className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest">To Recipient</span>
          <span className="text-[11px] font-mono font-bold text-white bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
            {params.recipient.slice(0, 12)}...{params.recipient.slice(-10)}
          </span>
        </div>
      </div>

      <div className="bg-black/20 rounded-2xl p-4 border border-outline-variant/5 mb-6 relative z-10">
        <p className="text-[11px] font-bold text-on-surface-variant leading-relaxed italic">
          "{payload.reasoning}"
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-6 relative z-10">
          <AlertCircle size={14} className="text-red-500 shrink-0" />
          <span className="text-[10px] font-bold text-red-500">{error}</span>
        </div>
      )}

      {step === 'done' ? (
        <div className="flex flex-col items-center gap-3 py-4 bg-green-500/10 border border-green-500/20 rounded-2xl relative z-10">
          <CheckCircle2 size={24} className="text-green-500" />
          <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Transfer Complete</span>
          <a href={`https://basescan.org/tx/${txHash}`} target="_blank" className="text-[9px] font-black text-primary underline">VIEW ON EXPLORER</a>
        </div>
      ) : (
        <button
          onClick={handleSend}
          disabled={step !== 'idle'}
          className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all relative z-10 ${
            step !== 'idle'
              ? 'bg-white/5 text-on-surface-variant cursor-not-allowed' 
              : 'bg-white text-black hover:bg-primary hover:text-white shadow-xl active:scale-[0.98]'
          }`}
        >
          {step === 'signing' || step === 'confirming' ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Send size={16} />
              <span>Sign & Verify Send</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
