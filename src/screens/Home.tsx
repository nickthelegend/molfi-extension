import { Search, Globe, Box, TrendingUp, Send } from 'lucide-react';
import { useAccount, useBalance, useEnsName } from 'wagmi';
import { useState, useEffect } from 'react';
import { API_URL } from '../constants/Config';

export function Home() {
  const { address } = useAccount();
  const { data: ensName } = useEnsName({ address: address as `0x${string}`, chainId: 1 });
  const { data: balance } = useBalance({ address: address as `0x${string}` });
  const [totalValue, setTotalValue] = useState<number | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!address) return;
      try {
        const res = await fetch(`${API_URL}/portfolio?walletAddress=${address}`);
        const json = await res.json();
        if (json.success) setTotalValue(json.data.totalValue);
      } catch (error) {
        console.error('Home portfolio fetch error:', error);
      }
    };
    fetchPortfolio();
  }, [address]);

  return (
    <div className="w-full h-full flex flex-col p-6 pt-12 pb-20 overflow-y-auto">
      <div className="flex-1">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
          GM, {ensName || (address ? address.slice(0, 6) : 'Ser')}
        </h1>
        <p className="text-on-surface-variant font-medium text-lg mb-10">
          Your bag is currently worth <span className="text-white font-black">${(totalValue || 0).toLocaleString()}</span>
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <Chip icon={Globe} label="Discover Alpha" />
          <Chip icon={Box} label="Portfolio" />
          <Chip icon={TrendingUp} label="High Yield" />
        </div>
      </div>

      {/* Chat Input */}
      <div className="bg-surface-container rounded-2xl p-4 border border-outline-variant/10">
        <div className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest mb-3 px-1">
          Ask anything, / for quick prompts
        </div>
        
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <ActionChip icon={Search} label="Research" />
            <ActionChip icon={Box} label="Token Analysis" />
            <ActionChip icon={Globe} label="Web Search" />
          </div>

          <div className="flex items-center gap-3 bg-black/20 rounded-xl px-4 py-3 border border-outline-variant/5 focus-within:border-primary/40 transition-all">
            <input 
              type="text" 
              placeholder="Start trading with AI..." 
              className="flex-1 bg-transparent text-xs font-medium text-white placeholder:text-on-surface-variant/30 focus:outline-none"
            />
            <button className="text-primary hover:text-white transition-colors">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/10 hover:border-primary/20 transition-all text-[11px] font-bold text-on-surface-variant hover:text-white">
      <Icon size={14} className="text-primary" />
      {label}
    </button>
  );
}

function ActionChip({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-[10px] font-bold text-on-surface-variant hover:text-white">
      <Icon size={12} className="text-primary" />
      {label}
    </button>
  );
}
