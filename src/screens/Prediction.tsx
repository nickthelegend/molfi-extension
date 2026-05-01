import { useState } from 'react';
import { TrendingUp, Sparkles, MessageSquare, ShieldCheck, Zap } from 'lucide-react';
import { MiroFishEngine } from '../components/swarm/MiroFishEngine';
import { db } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

export function Prediction() {
  const [showEngine, setShowEngine] = useState(false);
  const [marketId] = useState("polymarket_id_1"); // Mock ID
  const [question] = useState("Will Ethereum reach $5,000 by June 2026?");

  const history = useLiveQuery(() => db.swarmHistory.orderBy('timestamp').reverse().toArray());

  return (
    <div className="w-full h-full flex flex-col p-4 gap-4 overflow-y-auto">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
            <TrendingUp size={18} />
          </div>
          <h1 className="text-xl font-black text-white uppercase tracking-tight">Predictions</h1>
        </div>
      </div>

      {!showEngine ? (
        <div className="flex flex-col gap-4">
          {/* Active Market Card */}
          <div className="bg-surface-container rounded-[2rem] p-6 border border-outline-variant/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
              <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Active</span>
              </div>
            </div>

            <h2 className="text-lg font-black text-white mb-2 pr-12 leading-tight">
              {question}
            </h2>
            
            <div className="flex items-center gap-6 mb-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Yes</span>
                <span className="text-xl font-black text-white">$0.64</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">No</span>
                <span className="text-xl font-black text-white">$0.36</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setShowEngine(true)}
                className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-primary transition-all active:scale-[0.98]"
              >
                <Sparkles size={16} />
                Deploy Agent Swarm
              </button>
              
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                     <MessageSquare size={12} />
                     1.2k Debates
                   </div>
                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                     <ShieldCheck size={12} />
                     0G Anchored
                   </div>
                </div>
                <div className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  Alpha Signal: 78% Confidence
                </div>
              </div>
            </div>
          </div>

          {/* History Section */}
          <div className="flex flex-col gap-4">
            <h3 className="px-2 text-xs font-black text-on-surface-variant uppercase tracking-widest">Recent Swarms</h3>
            <div className="flex flex-col gap-2">
              {history?.map((item) => (
                <HistoryItem 
                  key={item.id}
                  title={item.question} 
                  result={item.direction} 
                  confidence={item.confidence} 
                  date={new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                />
              ))}
              {(!history || history.length === 0) && (
                <div className="p-8 text-center text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] bg-white/5 rounded-2xl">
                  No swarm history
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          <button 
            onClick={() => setShowEngine(false)}
            className="mb-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest hover:text-white flex items-center gap-2"
          >
            ← Back to Markets
          </button>
          <div className="flex-1 overflow-hidden">
            <MiroFishEngine marketId={marketId} question={question} />
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryItem({ title, result, confidence, date }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container/50 border border-outline-variant/5 hover:bg-white/5 transition-all cursor-pointer">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-black text-white">{title}</span>
        <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">{date}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className={`text-xs font-black ${result === 'YES' ? 'text-primary' : 'text-red-400'}`}>{result}</span>
          <span className="text-[9px] font-bold text-on-surface-variant">{confidence}% Conf.</span>
        </div>
        <Zap size={14} className="text-primary" />
      </div>
    </div>
  );
}
