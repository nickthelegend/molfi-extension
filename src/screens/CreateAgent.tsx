import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  Cpu,
  ArrowRight,
  Info,
  Loader2,
  Terminal,
  Users,
  Brain
} from 'lucide-react';
import { useAccount, useBalance, useEnsName } from 'wagmi';
import { useDebounce } from 'use-debounce';
import { API_URL } from '../constants/Config';
import { useEnsSubdomain } from '../hooks/useEnsSubdomain';

const STRATEGIES = [
  { id: 'DCA', name: 'DCA', desc: 'Dollar Cost Averaging', icon: TrendingUp },
  { id: 'Momentum', name: 'Momentum', desc: 'Trend Following', icon: Zap },
  { id: 'Arbitrage', name: 'Arbitrage', desc: 'Cross-DEX Arbitrage', icon: ShieldCheck },
  { id: 'Poly Copy', name: 'Poly Copy', desc: 'Copy Polymarket Whales', icon: Users },
  { id: 'MiroFish Alpha', name: 'Swarm Alpha', desc: 'Swarm Prediction Intel', icon: Brain },
  { id: 'AI Free Form', name: 'AI Free Form', desc: 'Natural Language Logic', icon: Cpu },
];

const AVATAR_COLORS = ['#b157fb', '#FF3B30', '#00C896', '#FF9500', '#5856D6', '#AF52DE'];

export function CreateAgent({ onBack, onSuccess }: { onBack: () => void, onSuccess: () => void }) {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { data: userEns } = useEnsName({ address, chainId: 1 });
  const { checkAvailability, registerSubdomain } = useEnsSubdomain();

  const ensParent = userEns ? userEns.replace('.eth', '') : null;

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingText, setLoadingText] = useState('Provisioning Agent...');

  // Form State
  const [name, setName] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [agentEnsSub, setAgentEnsSub] = useState('');
  const [ensSubError, setEnsSubError] = useState('');
  const [marketType, setMarketType] = useState<'tokens' | 'prediction'>('tokens');
  const [strategy, setStrategy] = useState('');
  const [freeFormPrompt, setFreeFormPrompt] = useState('');
  const [funding, setFunding] = useState('');
  const [riskLevel, setRiskLevel] = useState(5);
  const [tradingPairs, setTradingPairs] = useState(['ETH/USDC', 'BTC/USDC']);

  const fullEnsDomain = ensParent && agentEnsSub ? `${agentEnsSub}.${ensParent}.eth` : null;
  const [debouncedDomain] = useDebounce(fullEnsDomain, 600);
  const [ensAvailable, setEnsAvailable] = useState<boolean | null>(null);
  const [isCheckingEns, setIsCheckingEns] = useState(false);

  useEffect(() => {
    if (debouncedDomain) {
      setIsCheckingEns(true);
      checkAvailability(debouncedDomain)
        .then(setEnsAvailable)
        .finally(() => setIsCheckingEns(false));
    } else {
      setEnsAvailable(null);
    }
  }, [debouncedDomain, checkAvailability]);

  const [targetTrader, setTargetTrader] = useState('');

  // ... existing code ...

  const handleCreate = async () => {
    if (!address || !name || !strategy || !funding) return;
    
    setIsSubmitting(true);
    setLoadingText('Initializing OWS Wallet...');
    
    try {
      let agentId: string;
      let agentWalletAddress: string;

      if (fullEnsDomain && ensAvailable) {
        // Multi-step flow: Init -> Register ENS -> Finalize
        const initRes = await fetch(`${API_URL}/agents/init`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: address, name, avatarColor })
        });
        const initJson = await initRes.json();
        if (!initJson.success) throw new Error(initJson.error);

        agentId = initJson.agentId;
        agentWalletAddress = initJson.agentWalletAddress;

        setLoadingText('Awaiting ENS Signature...');
        const { txHash, success } = await registerSubdomain(fullEnsDomain, agentWalletAddress, 1);
        if (!success) throw new Error('ENS registration failed');

        setLoadingText('Finalizing Identity...');
        await fetch(`${API_URL}/agents/${agentId}/finalize`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ensSubdomain: fullEnsDomain,
            ensTxHash: txHash,
            market: marketType,
            strategy,
            funding: parseFloat(funding),
            riskLevel,
            tradingPairs,
            freeFormPrompt: strategy === 'AI Free Form' ? freeFormPrompt : null
          })
        });
      } else {
        // One-step flow
        const res = await fetch(`${API_URL}/agents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: address,
            name,
            strategy,
            market: marketType,
            avatarColor,
            createEns: !!agentEnsSub,
            config: {
              initialFunding: parseFloat(funding),
              riskLevel,
              tradingPairs,
              freeFormPrompt: strategy === 'AI Free Form' ? freeFormPrompt : null
            }
          })
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        agentId = json.data.agentId;
        agentWalletAddress = json.data.walletAddress;
      }

      // REGISTER TASK IN ORCHESTRATOR
      setLoadingText('Scheduling Autonomy...');
      const taskType = strategy === 'Poly Copy' ? 'polymarket_copy_trade' : 
                      strategy === 'MiroFish Alpha' ? 'polymarket_swarm_alpha' : 
                      'keeperhub_workflow';
      
      await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: agentWalletAddress,
          name: `${name} Automation`,
          type: taskType,
          schedule: 'minutely',
          payload: {
            targetWallet: targetTrader,
            scale: 0.1 // Default scale for copy trading
          }
        })
      });

      setLoadingText('Agent Live!');
      setTimeout(onSuccess, 1000);
    } catch (error: any) {
      console.error('Creation error:', error);
      alert(error.message || 'Creation failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-surface overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-outline-variant/10">
        <button onClick={onBack} className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-on-surface-variant transition-colors">
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-black text-white uppercase tracking-widest">Deploy Agent</span>
        <div className="w-10" />
      </div>

      {/* Progress */}
      <div className="px-6 py-4 flex gap-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-primary' : 'bg-white/5'}`} />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6 pt-4"
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Identity</h2>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Define your agent's persona</p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Agent Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alpha Hunter"
                    className="w-full bg-surface-container border border-outline-variant/10 rounded-2xl px-5 py-4 text-sm font-bold text-white placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Avatar Color</label>
                  <div className="flex gap-3">
                    {AVATAR_COLORS.map(color => (
                      <button 
                        key={color}
                        onClick={() => setAvatarColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${avatarColor === color ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {ensParent && (
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">ENS Subdomain (Optional)</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={agentEnsSub}
                        onChange={(e) => setAgentEnsSub(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="your-agent"
                        className="w-full bg-surface-container border border-outline-variant/10 rounded-2xl pl-5 pr-24 py-4 text-sm font-bold text-white placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/50 transition-colors"
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-on-surface-variant/40">
                        .{ensParent}.eth
                      </span>
                    </div>
                    {isCheckingEns && <Loader2 size={12} className="animate-spin text-primary ml-2" />}
                    {!isCheckingEns && ensAvailable !== null && (
                      <span className={`text-[9px] font-black uppercase tracking-widest ml-2 ${ensAvailable ? 'text-primary' : 'text-error'}`}>
                        {ensAvailable ? '✓ Available' : '✗ Taken'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6 pt-4"
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Strategy</h2>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Choose intelligence model</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {STRATEGIES.map(item => (
                  <button 
                    key={item.id}
                    onClick={() => setStrategy(item.id)}
                    className={`flex flex-col gap-3 p-4 rounded-2xl border transition-all text-left group relative overflow-hidden ${strategy === item.id ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(200,153,255,0.1)]' : 'bg-surface-container border-outline-variant/5 hover:border-outline-variant/20'}`}
                  >
                    <item.icon size={20} className={strategy === item.id ? 'text-primary' : 'text-on-surface-variant'} />
                    <div className="flex flex-col gap-1">
                      <span className={`text-[10px] font-black uppercase tracking-tight ${strategy === item.id ? 'text-white' : 'text-on-surface-variant'}`}>{item.name}</span>
                      <span className="text-[8px] font-bold text-on-surface-variant/60 leading-tight">{item.desc}</span>
                    </div>
                    {strategy === item.id && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <Check size={10} className="text-black" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {strategy === 'AI Free Form' && (
                <textarea 
                  value={freeFormPrompt}
                  onChange={(e) => setFreeFormPrompt(e.target.value)}
                  placeholder="Describe your custom trading logic in plain English..."
                  className="w-full h-32 bg-surface-container border border-outline-variant/10 rounded-2xl px-5 py-4 text-sm font-bold text-white placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                />
              )}

              {strategy === 'Poly Copy' && (
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Target Trader Wallet</label>
                  <input 
                    type="text" 
                    value={targetTrader}
                    onChange={(e) => setTargetTrader(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-surface-container border border-outline-variant/10 rounded-2xl px-5 py-4 text-sm font-bold text-white placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                  <p className="text-[8px] font-bold text-on-surface-variant/40 uppercase tracking-widest mt-1">The agent will automatically mirror trades from this wallet.</p>
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6 pt-4"
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Config</h2>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Set execution parameters</p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Initial Funding (USDC)</label>
                  <input 
                    type="number" 
                    value={funding}
                    onChange={(e) => setFunding(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-surface-container border border-outline-variant/10 rounded-2xl px-5 py-4 text-sm font-bold text-white placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                  <div className="flex justify-between px-1">
                    <span className="text-[8px] font-bold text-on-surface-variant/40 uppercase tracking-widest">Available: {balance?.formatted.slice(0, 6)} {balance?.symbol}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Risk Profile: {riskLevel}/10</label>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between px-1">
                    <span className="text-[8px] font-bold text-on-surface-variant/40">CONSERVATIVE</span>
                    <span className="text-[8px] font-bold text-primary">AGGRESSIVE</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6 pt-4"
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Review</h2>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Verify deployment details</p>
              </div>

              <div className="bg-surface-container rounded-3xl p-6 border border-outline-variant/10 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg" style={{ backgroundColor: avatarColor }}>
                    {name[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-white uppercase tracking-tight">{name}</span>
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">{strategy}</span>
                  </div>
                </div>

                <div className="h-px bg-white/5 w-full" />

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Funding</span>
                    <span className="text-[10px] font-black text-white">{funding} USDC</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">ENS Name</span>
                    <span className="text-[10px] font-black text-primary">{fullEnsDomain || 'NONE'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Network</span>
                    <span className="text-[10px] font-black text-white uppercase">Base Mainnet</span>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20 flex gap-3">
                <Info size={14} className="text-primary shrink-0 mt-0.5" />
                <p className="text-[9px] font-bold text-primary/80 leading-relaxed uppercase tracking-widest">
                  Deploying this agent will authorize the OWS secure enclave to execute strategies on your behalf.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-surface to-transparent pt-12">
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            {step > 1 && (
              <button 
                onClick={() => setStep(s => s - 1)}
                className="w-14 h-14 rounded-2xl bg-surface-container border border-outline-variant/10 flex items-center justify-center text-white hover:bg-white/5 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <button 
              onClick={() => {
                if (step < 4) setStep(s => s + 1);
                else handleCreate();
              }}
              disabled={
                (step === 1 && !name) || 
                (step === 2 && !strategy) || 
                (step === 3 && !funding) ||
                (step === 4 && fullEnsDomain && !ensAvailable)
              }
              className="flex-1 h-14 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-primary transition-all active:scale-[0.98] disabled:opacity-50 disabled:hover:bg-white"
            >
              {step < 4 ? (
                <>
                  Next Step
                  <ChevronRight size={16} />
                </>
              ) : (
                <>
                  {fullEnsDomain ? 'Deploy with ENS' : 'Deploy Swarm'}
                  <Sparkles size={16} />
                </>
              )}
            </button>
          </div>
          
          {step === 4 && fullEnsDomain && (
            <button 
              onClick={() => {
                // Clear ENS and submit
                setAgentEnsSub('');
                setTimeout(handleCreate, 100);
              }}
              className="w-full py-3 text-[10px] font-black text-on-surface-variant hover:text-white uppercase tracking-widest transition-colors"
            >
              Skip ENS & Deploy Directly
            </button>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-surface/95 flex flex-col items-center justify-center p-8 backdrop-blur-sm"
          >
            <div className="w-full max-w-xs flex flex-col gap-6">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-primary/20 flex items-center justify-center text-primary relative">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-3xl border-2 border-primary/20 border-t-primary"
                  />
                  <Bot size={32} />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">System Provisioning</span>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Deploying Agent</h3>
                </div>
              </div>

              <div className="bg-black/40 rounded-2xl p-4 border border-white/5 font-mono">
                <div className="flex items-center gap-2 mb-2">
                  <Terminal size={12} className="text-on-surface-variant" />
                  <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">Logs</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] text-primary/80 tracking-tight">$ {loadingText}</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-30">
                    <span className="text-[10px] text-white/50 tracking-tight">$ initializing_enclave_v2...</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
