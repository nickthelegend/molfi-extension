import { useState, useEffect } from 'react';
import { TrendingUp, Sparkles, MessageSquare, ShieldCheck, Zap, Globe, Users, ArrowLeft, ExternalLink } from 'lucide-react';
import { MiroFishEngine } from '../components/swarm/MiroFishEngine';
import { db } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

export function Prediction() {
  const [showEngine, setShowEngine] = useState(false);
  const [marketId, setMarketId] = useState(""); 
  const [question, setQuestion] = useState("");
  const [marketImage, setMarketImage] = useState("");
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const history = useLiveQuery(() => db.swarmHistory.orderBy('timestamp').reverse().toArray());

  useEffect(() => {
    // Check for pending swarm from background script
    if (typeof (window as any).chrome !== 'undefined' && (window as any).chrome.storage) {
      (window as any).chrome.storage.local.get(['pendingSwarm'], (result: any) => {
        if (result.pendingSwarm) {
          const { question: q, marketId: mId, timestamp } = result.pendingSwarm;
          if (Date.now() - timestamp < 60000) {
            setQuestion(q);
            setMarketId(mId);
            setSelectedHistoryId(null);
            setShowEngine(true);
            (window as any).chrome.storage.local.remove(['pendingSwarm']);
          }
        }
      });
    }
  }, []);

  const handleSyncFromTab = async () => {
    if (typeof (window as any).chrome === 'undefined' || !(window as any).chrome.tabs) return;
    setIsSyncing(true);
    try {
      const [tab] = await (window as any).chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.url?.includes('polymarket.com/event/')) {
        const results = await (window as any).chrome.scripting.executeScript({
          target: { tabId: tab.id! },
          func: () => {
            const h1 = document.querySelector('h1')?.innerText;
            const img = (document.querySelector('img[src*="polymarket"]') as HTMLImageElement)?.src;
            return { question: h1, image: img };
          }
        });
        
        if (results?.[0]?.result) {
          const { question: q, image } = results[0].result;
          if (q) setQuestion(q);
          if (image) setMarketImage(image);
          const mIdMatch = tab.url.match(/\/event\/([^/?]+)/);
          if (mIdMatch) setMarketId(mIdMatch[1]);
        }
      }
    } catch (e) {
      console.error("Failed to sync from tab", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleViewHistory = (id: number, q: string, mId: string) => {
    setQuestion(q);
    setMarketId(mId);
    setSelectedHistoryId(id);
    setShowEngine(true);
  };

  return (
    <div className="w-full h-full flex flex-col p-4 gap-4 overflow-y-auto pb-20 scrollbar-hide">
      <div className="flex items-center justify-between px-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#ad46ff]/20 flex items-center justify-center text-[#ad46ff]">
            <TrendingUp size={18} />
          </div>
          <h1 className="text-xl font-black text-white uppercase tracking-tight">Predictions</h1>
        </div>
        {!showEngine && (
          <button 
            onClick={handleSyncFromTab}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <Globe size={12} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Syncing...' : 'Sync Market'}
          </button>
        )}
      </div>

      {!showEngine ? (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {question ? (
            /* Active Market Card */
            <div className="bg-[#0f0f0f] rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group">
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#ad46ff]/10 blur-[80px] rounded-full group-hover:bg-[#ad46ff]/20 transition-all duration-700" />
              
              <div className="flex items-start gap-5 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  {marketImage ? (
                    <img src={marketImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Globe size={32} className="text-[#ad46ff]" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                      Live Market
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-white leading-tight">
                    {question}
                  </h2>
                </div>
              </div>
              
              <div className="flex items-center gap-8 mb-8 bg-white/5 p-5 rounded-3xl border border-white/5">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Yes Outcome</span>
                  <span className="text-2xl font-black text-white">$0.64</span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">No Outcome</span>
                  <span className="text-2xl font-black text-white">$0.36</span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => { setSelectedHistoryId(null); setShowEngine(true); }}
                  className="w-full bg-[#ad46ff] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.15em] text-xs flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(173,70,255,0.3)] hover:bg-white hover:text-black transition-all active:scale-[0.98]"
                >
                  <Users size={18} />
                  Deploy Agent Swarm
                </button>
                
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                       <MessageSquare size={12} className="text-[#ad46ff]" />
                       1.2k Debates
                     </div>
                     <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                       <ShieldCheck size={12} className="text-[#ad46ff]" />
                       0G Anchored
                     </div>
                  </div>
                  <div className="text-[9px] font-black text-[#ad46ff] uppercase tracking-widest">
                    78% Confidence Signal
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State / Manual Input */
            <div className="bg-[#0f0f0f] rounded-[2.5rem] p-10 border border-white/5 flex flex-col items-center text-center gap-6 relative overflow-hidden">
               <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center text-[#ad46ff] border border-white/5">
                  <Sparkles size={40} />
               </div>
               <div className="flex flex-col gap-2">
                 <h3 className="text-white font-black text-sm uppercase tracking-widest">No active market</h3>
                 <p className="text-[10px] font-bold text-gray-500 uppercase leading-relaxed max-w-[200px]">
                   Sync from a Polymarket tab or enter a question below to launch a swarm.
                 </p>
               </div>
               
               <div className="w-full flex flex-col gap-3">
                 <input 
                   type="text" 
                   placeholder="e.g. Will ETH reach $5,000 by June?"
                   className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white placeholder:text-gray-700 focus:border-[#ad46ff]/50 outline-none transition-all"
                   onKeyDown={(e: any) => {
                     if (e.key === 'Enter' && e.target.value) {
                       setQuestion(e.target.value);
                       setMarketId("manual-" + Date.now());
                     }
                   }}
                 />
                 <button 
                   onClick={handleSyncFromTab}
                   className="w-full py-4 rounded-2xl bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-[#ad46ff] hover:text-white transition-all flex items-center justify-center gap-2"
                 >
                   <Globe size={14} />
                   Sync Current Tab
                 </button>
               </div>
            </div>
          )}

          {/* History Section */}
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Recent Swarm Analysis</h3>
              <div className="h-px flex-1 bg-white/5 mx-4" />
            </div>
            <div className="flex flex-col gap-2.5">
              {history?.map((item) => (
                <HistoryItem 
                  key={item.id}
                  title={item.question} 
                  result={item.direction} 
                  confidence={item.confidence} 
                  date={new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                  onClick={() => handleViewHistory(item.id as number, item.question, item.marketId)}
                />
              ))}
              {(!history || history.length === 0) && (
                <div className="p-10 text-center text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] bg-white/[0.02] border border-dashed border-white/5 rounded-[2rem]">
                  No analysis history
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setShowEngine(false)}
              className="p-2 bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all border border-white/5"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black text-[#ad46ff] uppercase tracking-widest">Swarm Intelligence</span>
              <span className="text-[11px] font-bold text-white max-w-[150px] truncate text-center">{question}</span>
            </div>
            <div className="w-10" />
          </div>
          
          <div className="flex-1 overflow-hidden">
            <MiroFishEngine marketId={marketId} question={question} historyId={selectedHistoryId} />
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryItem({ title, result, confidence, date, onClick }: any) {
  return (
    <div onClick={onClick} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-[#0f0f0f] border border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer group">
      <div className="flex flex-col gap-1 flex-1 pr-4">
        <span className="text-[11px] font-black text-white group-hover:text-[#ad46ff] transition-colors line-clamp-1">{title}</span>
        <div className="flex items-center gap-3">
          <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{date}</span>
          <div className="w-1 h-1 rounded-full bg-gray-700" />
          <span className="text-[8px] font-black text-[#ad46ff] uppercase tracking-widest flex items-center gap-1">
            <Zap size={8} /> Alpha
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className={`text-[11px] font-black tracking-widest ${result === 'YES' ? 'text-green-500' : 'text-red-500'}`}>{result}</span>
          <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{confidence}%</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#ad46ff] transition-all">
          <ExternalLink size={12} />
        </div>
      </div>
    </div>
  );
}

