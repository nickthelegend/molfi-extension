import React, { useState } from 'react';
import { Layers, CheckCircle2, Loader2, AlertCircle, ShieldCheck, Zap } from 'lucide-react';
import { useAccount, useWalletClient } from 'wagmi';

interface KeeperHubCardProps {
  payload: {
    reasoning: string;
    plan: {
      steps: Array<{
        params: {
          plugin: string;
          action: string;
          params: any;
        }
      }>
    }
  }
}

export const KeeperHubCard: React.FC<KeeperHubCardProps> = ({ payload }) => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [step, setStep] = useState<'idle' | 'executing' | 'done' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const config = payload.plan.steps[0].params;

  const handleExecute = async () => {
    if (!walletClient || !address) return;
    setStep('executing');
    setError(null);

    try {
      // Logic for executing KeeperHub plugin actions would go here
      // For the hackathon, we simulate the complex protocol interaction
      await new Promise(r => setTimeout(r, 2000));
      
      setStep('done');
      setTxHash("0x" + Math.random().toString(16).slice(2, 66));
    } catch (err: any) {
      setError(err.message);
      setStep('error');
    }
  };

  return (
    <div className="bg-[#0a0a0a] rounded-3xl p-6 border border-primary/20 shadow-[0_0_30px_rgba(173,70,255,0.1)] relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Zap size={80} className="text-primary" />
      </div>
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-primary" />
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">KeeperHub Protocol</span>
        </div>
        <div className="px-2 py-0.5 rounded bg-primary/20 border border-primary/40">
          <span className="text-[8px] font-black text-primary uppercase">{config.plugin}</span>
        </div>
      </div>

      <div className="mb-6 relative z-10">
        <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest mb-1 block">Action</span>
        <h3 className="text-xl font-black text-white uppercase tracking-tight">{config.action.replace('_', ' ')}</h3>
        
        <div className="mt-4 grid grid-cols-2 gap-2">
          {Object.entries(config.params).map(([key, val]: [string, any]) => (
            <div key={key} className="bg-white/5 p-2 rounded-lg border border-white/5">
              <span className="text-[8px] font-bold text-on-surface-variant uppercase block mb-0.5">{key}</span>
              <span className="text-[10px] font-mono font-bold text-white truncate block">{String(val)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 mb-6 relative z-10">
        <p className="text-[11px] font-bold text-on-surface-variant leading-relaxed">
          {payload.reasoning}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-6 relative z-10">
          <AlertCircle size={14} className="text-red-500 shrink-0" />
          <span className="text-[10px] font-bold text-red-500">{error}</span>
        </div>
      )}

      {step === 'done' ? (
        <div className="flex flex-col items-center gap-3 py-4 bg-primary/10 border border-primary/20 rounded-2xl relative z-10">
          <CheckCircle2 size={24} className="text-primary" />
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Protocol Execution Success</span>
          <span className="text-[8px] font-mono text-on-surface-variant">TX: {txHash?.slice(0, 20)}...</span>
        </div>
      ) : (
        <button
          onClick={handleExecute}
          disabled={step === 'executing'}
          className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all relative z-10 ${
            step === 'executing'
              ? 'bg-primary/10 text-primary cursor-not-allowed' 
              : 'bg-primary text-white hover:bg-primary/80 shadow-[0_0_20px_rgba(173,70,255,0.3)] active:scale-[0.98]'
          }`}
        >
          {step === 'executing' ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Interacting...</span>
            </>
          ) : (
            <>
              <ShieldCheck size={16} />
              <span>Execute KeeperHub Intent</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
