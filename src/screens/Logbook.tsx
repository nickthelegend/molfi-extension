import { BookText, Search, Wallet, BookOpen } from 'lucide-react';

export function Logbook() {
  return (
    <div className="w-full h-full flex flex-col p-4 gap-4 overflow-y-auto">
      <div className="flex items-center gap-3 px-2">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
          <BookText size={18} />
        </div>
        <h1 className="text-xl font-black text-white uppercase tracking-tight">Logbook</h1>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" size={16} />
        <input 
          type="text" 
          placeholder="Search past trades..." 
          className="w-full bg-surface-container border border-outline-variant/10 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold text-white placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/40 transition-all"
        />
      </div>

      <div className="bg-surface-container rounded-[2rem] p-8 border border-outline-variant/10 flex-1 flex flex-col gap-6">
        {/* Tabs */}
        <div className="flex items-center gap-6 px-2">
          <button className="text-[10px] font-black text-white uppercase tracking-[0.2em] relative">
            All
            <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-primary" />
          </button>
          <button className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] hover:text-white transition-colors">
            Wins
          </button>
          <button className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] hover:text-white transition-colors">
            Loss
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
          <div className="w-24 h-24 text-on-surface-variant/20 mb-6">
            <BookOpen size={96} strokeWidth={1} />
          </div>
          <p className="text-sm font-black text-on-surface-variant mb-8 uppercase tracking-widest leading-relaxed">
            You don't have any trades on Molfi.
          </p>
          
          <button className="flex items-center gap-3 bg-white/5 hover:bg-white/10 text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] border border-outline-variant/10 transition-all active:scale-95">
            <Wallet size={16} className="text-primary" />
            Portfolio
          </button>
        </div>
      </div>
    </div>
  );
}
