import React, { useState } from 'react';
import { ArrowLeft, User, Coins, ChevronRight, ShieldCheck, Zap } from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
export function Send({ onBack }: { onBack: () => void }) {
  const { address } = useAccount();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const { data: balance } = useBalance({ address });

  console.log(`[Send] Render. Address: ${address}, Recipient: ${recipient}, Amount: ${amount}`);
  console.log(`[Send] Balance: ${balance?.formatted} ${balance?.symbol}`);

  return (
    <div className="w-full h-full flex flex-col bg-background p-6 pt-12">
      <div className="flex items-center justify-between mb-10">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-surface-container border border-outline-variant/10 flex items-center justify-center text-white hover:bg-primary/20 transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Premium Send</span>
        </div>
      </div>

      <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Transfer Funds</h1>
      <p className="text-on-surface-variant font-medium text-lg mb-10">Send assets to any wallet or ENS.</p>

      <div className="flex flex-col gap-6">
        {/* Recipient Input */}
        <div className="bg-surface-container rounded-3xl p-6 border border-outline-variant/10 relative overflow-hidden group focus-within:border-primary/40 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <User size={60} className="text-white" />
          </div>
          <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block mb-4">Recipient</span>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <User size={16} className="text-primary" />
            </div>
            <input 
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x... or ENS name"
              className="flex-1 bg-transparent text-lg font-bold text-white placeholder:text-on-surface-variant/20 focus:outline-none"
            />
          </div>
        </div>

        {/* Amount Input */}
        <div className="bg-surface-container rounded-3xl p-6 border border-outline-variant/10 relative overflow-hidden focus-within:border-primary/40 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Coins size={60} className="text-white" />
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Amount</span>
            <span className="text-[10px] font-black text-primary uppercase">Max: {balance?.formatted.slice(0, 8)} {balance?.symbol}</span>
          </div>
          <div className="flex items-baseline gap-3">
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent text-5xl font-black text-white placeholder:text-on-surface-variant/20 focus:outline-none"
            />
            <span className="text-xl font-black text-primary">{balance?.symbol}</span>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-10">
        <button 
          disabled={!recipient || !amount}
          className={`w-full py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 transition-all shadow-2xl ${
            !recipient || !amount 
              ? 'bg-white/5 text-on-surface-variant cursor-not-allowed' 
              : 'bg-white text-black hover:bg-primary hover:text-white hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          <ShieldCheck size={20} />
          <span>Confirm Transfer</span>
        </button>
        
        <div className="mt-6 flex items-center justify-center gap-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <Zap size={12} className="text-primary" />
            <span>Instant</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-white/10" />
          <span>Low Fees</span>
        </div>
      </div>
    </div>
  );
}
