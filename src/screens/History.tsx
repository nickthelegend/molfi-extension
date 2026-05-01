import { History as HistoryIcon, Search, PlusCircle, BookOpen } from 'lucide-react';

export function History() {
  return (
    <div className="w-full h-full flex flex-col p-4 gap-4 overflow-y-auto">
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
    </div>
  );
}
