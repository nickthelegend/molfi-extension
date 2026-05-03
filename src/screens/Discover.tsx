import { useState, useEffect } from 'react';
import { Search, TrendingUp, BarChart2, Volume2, Target, Percent, Loader2 } from 'lucide-react';

export function Discover() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setIsLoading(true);
        // Fetch top volume pairs for Base and Ethereum from DexScreener
        const res = await fetch('https://api.dexscreener.com/latest/dex/search?q=base%20eth');
        if (!res.ok) throw new Error('Network response was not ok');
        const json = await res.json();
        
        if (!json.pairs) throw new Error('No pairs found');

        // Sort by volume and filter for Base/Ethereum
        const sorted = json.pairs
          .filter((p: any) => p.baseToken && (p.chainId === 'base' || p.chainId === 'ethereum'))
          .sort((a: any, b: any) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))
          .slice(0, 15);

        const mapped = sorted.map((p: any) => ({
          name: p.baseToken.name,
          symbol: p.baseToken.symbol,
          price: `$${parseFloat(p.priceUsd || '0').toLocaleString(undefined, { maximumFractionDigits: p.priceUsd < 1 ? 6 : 2 })}`,
          change: `${p.priceChange?.h24 > 0 ? '+' : ''}${p.priceChange?.h24?.toFixed(2)}%`,
          logo: p.info?.imageUrl || `https://tokens.llama.fi/token/${p.chainId === 'base' ? 'base' : 'ethereum'}/${p.baseToken.address}`
        }));

        setTokens(mapped);
      } catch (error) {
        console.error('Discover fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
    <div className="w-full h-full flex flex-col p-4 gap-4 overflow-y-auto pb-20">
      <div className="flex items-center gap-3 px-2">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
          <TrendingUp size={18} />
        </div>
        <h1 className="text-xl font-black text-white uppercase tracking-tight">Discover</h1>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" size={16} />
        <input 
          type="text" 
          placeholder="Search protocols & tokens..." 
          className="w-full bg-surface-container border border-outline-variant/10 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold text-white placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/40 transition-all"
        />
      </div>

      <div className="bg-surface-container rounded-[2rem] p-4 border border-outline-variant/10 flex-1 flex flex-col gap-6">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <TabItem label="Trending" active icon={TrendingUp} />
          <TabItem label="Mcap" icon={BarChart2} />
          <TabItem label="Volume" icon={Volume2} />
          <TabItem label="Top picks" icon={Target} />
          <TabItem label="Price Change" icon={Percent} />
        </div>

        <div className="flex flex-col gap-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-on-surface-variant/20">
              <Loader2 className="animate-spin" size={24} />
            </div>
          ) : (
            tokens.map((token, i) => (
              <TrendingItem 
                key={i}
                name={token.name} 
                symbol={token.symbol} 
                price={token.price} 
                change={token.change}
                icon={token.logo}
              />
            ))
          )}
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

function TrendingItem({ name, symbol, price, change, icon }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-outline-variant/5 hover:bg-white/10 transition-all cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center overflow-hidden text-[8px] font-black">
          {icon ? <img src={icon} className="w-full h-full object-cover" alt="" /> : symbol[0]}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-black text-white uppercase tracking-tight truncate max-w-[100px]">{name}</span>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{symbol}</span>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-sm font-black text-white">{price}</span>
        <span className={`text-[10px] font-bold ${change.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>{change}</span>
      </div>
    </div>
  );
}
