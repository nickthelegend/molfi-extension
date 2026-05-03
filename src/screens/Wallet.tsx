import { useState, useEffect, useCallback } from 'react';
import { ArrowDownLeft, RefreshCw, ArrowUpRight, ListFilter, EyeOff, Loader2, ShieldCheck, FileText, ExternalLink } from 'lucide-react';
import { useAccount, useBalance, useEnsName } from 'wagmi';
import { API_URL } from '../constants/Config';

export function Wallet({ onAction }: { onAction: (action: string) => void }) {
  const { address } = useAccount();
  const { data: nativeBalance, isLoading: isNativeLoading } = useBalance({ address: address as `0x${string}` });
  const { data: ensName } = useEnsName({ address: address as `0x${string}`, chainId: 1 });

  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [agentWallets, setAgentWallets] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'tokens' | 'agents' | 'reports'>('tokens');
  const [isLoading, setIsLoading] = useState(true);
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({});

  const fetchPortfolio = useCallback(async () => {
    if (!address) return;
    try {
      const [pRes, aRes] = await Promise.all([
        fetch(`${API_URL}/portfolio?walletAddress=${address}`),
        fetch(`${API_URL}/agents?walletAddress=${address}`)
      ]);
      const [pJson, aJson] = await Promise.all([pRes.json(), aRes.json()]);
      
      if (pJson.success) setPortfolioData(pJson.data);
      if (aJson.success) setAgentWallets(aJson.data);

      const assetAddresses = pJson.data?.assets?.map((a: any) => `ethereum:${a.address}`) || [];
      const ids = [...assetAddresses, 'ethereum:0x0000000000000000000000000000000000000000'].join(',');
      const priceRes = await fetch(`https://coins.llama.fi/prices/current/${ids}`);
      const priceJson = await priceRes.json();
      const prices: Record<string, number> = {};
      if (priceJson.coins) {
        Object.keys(priceJson.coins).forEach(key => {
          prices[key.split(':')[1].toLowerCase()] = priceJson.coins[key].price;
        });
      }
      setTokenPrices(prices);
    } catch (error) {
      console.error('Portfolio fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => { fetchPortfolio(); }, [fetchPortfolio]);

  const totalValue = portfolioData?.totalValue || 0;
  const ethPrice = tokenPrices['0x0000000000000000000000000000000000000000'] || 2500;
  const nativeValue = nativeBalance ? parseFloat(nativeBalance.formatted) * ethPrice : 0;

  return (
    <div className="w-full h-full flex flex-col p-4 gap-4 overflow-y-auto pb-20">
      <div className="bg-surface-container rounded-[2rem] p-6 border border-outline-variant/10 relative overflow-hidden group">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 blur-[80px] rounded-full group-hover:bg-primary/10 transition-all duration-1000" />
        <div className="flex justify-between items-center mb-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
              {ensName || (address ? `@${address.slice(0, 6)}...${address.slice(-4)}` : '@Explorer')}
            </span>
            <EyeOff size={12} className="text-on-surface-variant/40" />
          </div>
          {portfolioData && (
            <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${portfolioData.dailyPnL >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {portfolioData.dailyPnL >= 0 ? '+' : ''}{portfolioData.dailyPnLPct.toFixed(2)}%
            </div>
          )}
        </div>
        <div className="flex items-baseline gap-2 mb-8 relative z-10">
          <span className="text-4xl font-black text-white">
            ${(totalValue + nativeValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`text-xs font-bold ${portfolioData?.dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {portfolioData?.dailyPnL >= 0 ? '+' : ''}{portfolioData?.dailyPnLPct.toFixed(1)}%
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 relative z-10">
          <WalletAction icon={ArrowDownLeft} label="Receive" onClick={() => onAction('receive')} />
          <WalletAction icon={RefreshCw} label="Swap" onClick={() => onAction('swap')} />
          <WalletAction icon={ArrowUpRight} label="Send" onClick={() => onAction('send')} />
        </div>
      </div>

      <div className="bg-surface-container rounded-[2rem] p-4 border border-outline-variant/10 flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveSubTab('tokens')} className={`text-xs font-black uppercase tracking-wider relative transition-colors ${activeSubTab === 'tokens' ? 'text-white' : 'text-on-surface-variant hover:text-white'}`}>
              Tokens {activeSubTab === 'tokens' && <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-primary" />}
            </button>
            <button onClick={() => setActiveSubTab('agents')} className={`text-xs font-black uppercase tracking-wider relative transition-colors ${activeSubTab === 'agents' ? 'text-white' : 'text-on-surface-variant hover:text-white'}`}>
              Agents {activeSubTab === 'agents' && <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-primary" />}
            </button>
            <button onClick={() => setActiveSubTab('reports')} className={`text-xs font-black uppercase tracking-wider relative transition-colors ${activeSubTab === 'reports' ? 'text-white' : 'text-on-surface-variant hover:text-white'}`}>
              Reports {activeSubTab === 'reports' && <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-primary" />}
            </button>
          </div>
          <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-on-surface-variant"><ListFilter size={16} /></button>
        </div>

        <div className="flex flex-col gap-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-on-surface-variant/40"><Loader2 className="animate-spin" size={24} /><span className="text-[10px] font-black uppercase tracking-widest">Syncing Portfolio...</span></div>
          ) : activeSubTab === 'tokens' ? (
            <>
              <TokenItem name="Ethereum" symbol="ETH" balance={nativeBalance ? parseFloat(nativeBalance.formatted).toFixed(4) : '0.0000'} value={`$${nativeValue.toFixed(2)}`} change="+0.00%" color="text-green-400" icon="https://cryptologos.cc/logos/ethereum-eth-logo.png" />
              {portfolioData?.assets.map((asset: any) => {
                const price = tokenPrices[asset.address.toLowerCase()] || 0;
                const value = parseFloat(asset.amount) * price;
                return <TokenItem key={asset.address} name={asset.symbol} symbol={asset.symbol} balance={parseFloat(asset.amount).toFixed(2)} value={`$${value.toFixed(2)}`} change="+0.00%" color="text-green-400" icon={`https://api.dicebear.com/7.x/identicon/svg?seed=${asset.symbol}`} />;
              })}
            </>
          ) : activeSubTab === 'agents' ? (
            <div className="flex flex-col gap-2">
              {agentWallets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant/20 gap-4"><ShieldCheck size={48} strokeWidth={1} /><span className="text-[10px] font-black uppercase tracking-[0.2em]">No active agent wallets</span></div>
              ) : (
                agentWallets.map(agent => (
                  <div key={agent._id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-outline-variant/5 hover:bg-white/10 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all"><ShieldCheck size={20} /></div>
                      <div className="flex flex-col"><span className="text-sm font-black text-white">{agent.name}</span><span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{agent.agentWalletAddress.slice(0,10)}...</span></div>
                    </div>
                    <div className="flex flex-col items-end"><span className="text-sm font-black text-primary">+{agent.totalPnLPct}%</span><span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">PnL (All Time)</span></div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {portfolioData?.researchReports?.length > 0 ? (
                portfolioData.researchReports.map((report: any, idx: number) => (
                  <a 
                    key={idx} 
                    href={report.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-outline-variant/5 hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all"><FileText size={20} /></div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white group-hover:text-primary transition-colors">{report.title}</span>
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{new Date(report.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <ExternalLink size={16} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                  </a>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant/20 gap-4">
                  <FileText size={48} strokeWidth={1} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">No research reports found</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WalletAction({ icon: Icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 group">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white border border-outline-variant/10 group-hover:bg-primary/20 group-hover:border-primary/40 group-hover:text-primary transition-all"><Icon size={20} /></div>
      <span className="text-[10px] font-bold text-on-surface-variant group-hover:text-white uppercase tracking-widest">{label}</span>
    </button>
  );
}

function TokenItem({ name, symbol, balance, value, change, color, icon }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-outline-variant/5 hover:bg-white/10 transition-all cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center overflow-hidden"><img src={icon} alt={name} className="w-full h-full object-cover" /></div>
        <div className="flex flex-col"><span className="text-sm font-black text-white">{name}</span><span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{balance} {symbol}</span></div>
      </div>
      <div className="flex flex-col items-end"><span className="text-sm font-black text-white">{value}</span><span className={`text-[10px] font-bold ${color}`}>{change}</span></div>
    </div>
  );
}
