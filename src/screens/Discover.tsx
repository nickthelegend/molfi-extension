import React from 'react';
import { Search, TrendingUp, BarChart2, Volume2, Target, Percent } from 'lucide-react';

export function Discover() {
  return (
    <div className="w-full h-full flex flex-col p-4 gap-4 overflow-y-auto">
      <div className="flex items-center gap-3 px-2">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
          <TrendingUp size={18} />
        </div>
        <h1 className="text-xl font-black text-white uppercase tracking-tight">Discover</h1>
      </div>

      {/* Search */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" size={16} />
        <input 
          type="text" 
          placeholder="Search tokens..." 
          className="w-full bg-surface-container border border-outline-variant/10 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold text-white placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/40 transition-all"
        />
      </div>

      <div className="bg-surface-container rounded-[2rem] p-4 border border-outline-variant/10 flex-1 flex flex-col gap-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <TabItem label="Trending" active icon={TrendingUp} />
          <TabItem label="Mcap" icon={BarChart2} />
          <TabItem label="Volume" icon={Volume2} />
          <TabItem label="Top picks" icon={Target} />
          <TabItem label="Price Change" icon={Percent} />
        </div>

        {/* Token List */}
        <div className="flex flex-col gap-2">
          <TrendingItem name="Staked Orca" symbol="xORCA" price="$2.811" change="+12.81%" />
          <TrendingItem name="Collector Crypt" symbol="CARDS" price="$0.115" change="+3.44%" />
          <TrendingItem name="HYPE" symbol="HYPE" price="$40.64" change="+1.68%" />
          <TrendingItem name="Avici" symbol="AVICI" price="$0.951" change="+1.48%" />
          <TrendingItem name="Raydium" symbol="RAY" price="$0.841" change="+1.01%" />
          <TrendingItem name="PUMPCADE" symbol="PUMPCADE" price="$0.033" change="+0.87%" />
        </div>
      </div>
    </div>
  );
}

function TabItem({ label, active, icon: Icon }: any) {
  return (
    <button className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
      active ? 'bg-white/10 text-white' : 'text-on-surface-variant hover:text-white'
    }`}>
      <Icon size={12} className={active ? 'text-primary' : ''} />
      {label}
    </button>
  );
}

function TrendingItem({ name, symbol, price, change }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-outline-variant/5 hover:bg-white/10 transition-all cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center overflow-hidden">
          <div className="w-full h-full bg-primary/10 flex items-center justify-center font-black text-primary text-xs">
            {symbol[0]}
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-black text-white">{name}</span>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{symbol}</span>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-sm font-black text-white">{price}</span>
        <span className="text-[10px] font-bold text-green-400">{change}</span>
      </div>
    </div>
  );
}
