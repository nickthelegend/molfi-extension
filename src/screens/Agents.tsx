import { Bot, Sparkles, PlusCircle, ShieldCheck, Zap } from 'lucide-react';

export function Agents() {
  return (
    <div className="w-full h-full flex flex-col p-6 gap-6 overflow-y-auto">
      <div className="flex items-center gap-3 pt-6">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(200,153,255,0.15)]">
          <Bot size={22} />
        </div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">AI Agents</h1>
      </div>

      <div className="bg-surface-container rounded-[2rem] p-8 border border-outline-variant/10 relative overflow-hidden group">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 blur-[60px] rounded-full group-hover:bg-primary/20 transition-all duration-700" />
        
        <div className="flex flex-col gap-6 relative z-10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Next-Gen Intelligence</span>
            </div>
            <h2 className="text-xl font-black text-white leading-tight">
              Deploy Your First <br/> Autonomous Agent
            </h2>
            <p className="text-xs font-bold text-on-surface-variant leading-relaxed">
              Molfi agents trade 24/7, analyze on-chain signals, and execute complex cross-chain strategies with 0G security.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-primary transition-all active:scale-[0.98] shadow-lg shadow-black/20">
              <PlusCircle size={16} />
              Deploy Agent
            </button>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                <ShieldCheck size={14} className="text-primary" />
                0G Encrypted
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                <Zap size={14} className="text-primary" />
                Instant Execution
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-2">Templates</h3>
        <div className="flex flex-col gap-3">
          <AgentTemplate icon={Zap} title="Trend Sniper" desc="High-frequency momentum trader" />
          <AgentTemplate icon={ShieldCheck} title="Alpha Harvester" desc="Early token detection & accumulation" />
        </div>
      </div>
    </div>
  );
}

function AgentTemplate({ icon: Icon, title, desc }: any) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container/50 border border-outline-variant/5 hover:bg-white/5 transition-all cursor-pointer group">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
        <Icon size={18} />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-black text-white uppercase tracking-tight">{title}</span>
        <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">{desc}</span>
      </div>
    </div>
  );
}
