import React from 'react';
import { TrendingUp, Search, Sparkles } from 'lucide-react';

interface PolymarketListCardProps {
  payload: {
    markets: Array<{
      id: string;
      question: string;
      volume: string;
    }>;
  };
  onResearch: (question: string, id: string) => void;
}

export const PolymarketListCard: React.FC<PolymarketListCardProps> = ({ payload, onResearch }) => {
  return (
    <div className="bg-surface-container rounded-3xl p-6 border border-outline-variant/10 shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-primary" />
          <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Alpha Detected</span>
        </div>
        <span className="text-[10px] font-black text-primary">POLYMARKET</span>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        {payload.markets.map((m) => (
          <div 
            key={m.id} 
            className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-primary/40 transition-all group cursor-pointer"
            onClick={() => onResearch(m.question, m.id)}
          >
            <div className="flex justify-between items-start gap-4 mb-2">
              <span className="text-[11px] font-bold text-white leading-tight flex-1">{m.question}</span>
              <div className="bg-primary/20 px-2 py-0.5 rounded text-[8px] font-black text-primary">
                NEW
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search size={10} className="text-on-surface-variant" />
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Research Available</span>
              </div>
              <Sparkles size={12} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>

      <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest text-center">
        Tap a market to trigger Swarm Research
      </p>
    </div>
  );
};
