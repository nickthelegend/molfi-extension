import { useState, useEffect, useCallback } from 'react';
import { History as HistoryIcon, Search, PlusCircle, BookOpen, Loader2, MessageSquare } from 'lucide-react';
import { useAccount } from 'wagmi';
import { API_URL } from '../constants/Config';

export function History() {
  const { address } = useAccount();
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    if (!address) return;
    try {
      const res = await fetch(`${API_URL}/chat/sessions?walletAddress=${address}`);
      const json = await res.json();
      if (json.success) setSessions(json.data);
    } catch (error) {
      console.error('History fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return (
    <div className="w-full h-full flex flex-col p-4 gap-4 overflow-y-auto pb-20">
      <div className="flex items-center gap-3 px-2">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
          <HistoryIcon size={18} />
        </div>
        <h1 className="text-xl font-black text-white uppercase tracking-tight">History</h1>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" size={16} />
        <input 
          type="text" 
          placeholder="Search for past conversations..." 
          className="w-full bg-surface-container border border-outline-variant/10 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold text-white placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/40 transition-all"
        />
      </div>

      <div className="flex-1 flex flex-col gap-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-on-surface-variant/20">
            <Loader2 className="animate-spin" size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest">Syncing History...</span>
          </div>
        ) : sessions.length > 0 ? (
          sessions.map(session => (
            <div key={session._id} className="flex items-center justify-between p-4 rounded-2xl bg-surface-container/50 border border-outline-variant/5 hover:bg-white/5 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                  <MessageSquare size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white uppercase tracking-tight">{session.title}</span>
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">
                    {new Date(session.updatedAt).toLocaleDateString()} • {session.messageCount} messages
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-surface-container rounded-[2rem] p-8 border border-outline-variant/10 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 text-on-surface-variant/20 mb-6">
              <BookOpen size={96} strokeWidth={1} />
            </div>
            <p className="text-sm font-black text-on-surface-variant mb-8 uppercase tracking-widest">No chat history found.</p>
            
            <button className="flex items-center gap-3 bg-white/5 hover:bg-white/10 text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] border border-outline-variant/10 transition-all active:scale-95">
              <PlusCircle size={16} className="text-primary" />
              Start a new chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
