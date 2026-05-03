import { Search, Globe, Box, TrendingUp, Send, User, Bot as BotIcon, Loader2, Plus, Sparkles } from 'lucide-react';
import { useAccount, useBalance, useEnsName } from 'wagmi';
import { useState, useEffect, useRef } from 'react';
import { API_URL } from '../constants/Config';
import { SwapCard } from '../components/chat/SwapCard';
import { SendCard } from '../components/chat/SendCard';
import { KeeperHubCard } from '../components/chat/KeeperHubCard';
import { PolymarketListCard } from '../components/chat/PolymarketListCard';
import { motion, AnimatePresence } from 'framer-motion';

export function Home() {
  const { address } = useAccount();
  const { data: ensName } = useEnsName({ address: address as `0x${string}`, chainId: 1 });
  const [totalValue, setTotalValue] = useState<number | null>(null);
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('[Home] Mounted');
    if (address) console.log('[Home] Account connected:', address);
  }, [address]);

  useEffect(() => {
    if (scrollRef.current) {
      console.log('[Home] Scrolling to bottom');
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!address) return;
      console.log(`[Home] Fetching portfolio for ${address}...`);
      try {
        const res = await fetch(`${API_URL}/portfolio?walletAddress=${address}`);
        const json = await res.json();
        console.log('[Home] Portfolio response:', json);
        if (json.success) setTotalValue(json.data.totalValue);
      } catch (error) {
        console.error('[Home] Portfolio fetch error:', error);
      }
    };
    fetchPortfolio();
  }, [address]);

  const handleSend = async (customMessage?: string) => {
    const text = customMessage || input;
    console.log(`[Home] handleSend called with text: "${text}"`);
    if (!text.trim()) {
      console.warn('[Home] Empty text, skipping');
      return;
    }
    if (!address) {
      console.warn('[Home] No account connected, skipping');
      return;
    }

    const userMsg = { role: 'user', content: text, timestamp: new Date() };
    console.log('[Home] Adding user message to state');
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      console.log(`[Home] POST -> ${API_URL}/chat/ask`);
      console.log(`[Home] Payload:`, { message: text, walletAddress: address });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn('[Home] Request timeout reached (15s)');
        controller.abort();
      }, 15000);

      const res = await fetch(`${API_URL}/chat/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, walletAddress: address }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      console.log(`[Home] Response status: ${res.status}`);
      const json = await res.json();
      console.log('[Home] Response body:', json);
      
      if (json.success) {
        console.log('[Home] Adding assistant message to state');
        setMessages(prev => [...prev, json.data]);
      } else {
        console.error('[Home] API returned success: false', json.error);
        throw new Error(json.error || 'Unknown API error');
      }
    } catch (error: any) {
      console.error('[Home] handleSend Error:', error);
      const errorMsg = { 
        role: 'assistant', 
        content: `Error: ${error.message === 'signal is aborted' ? 'Request timed out.' : 'Failed to reach agent.'} Please ensure the API is running at ${API_URL}`, 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      console.log('[Home] isTyping -> false');
      setIsTyping(false);
    }
  };

  const triggerResearch = (question: string, id: string) => {
    handleSend(`Research the Polymarket event: "${question}" (ID: ${id})`);
  };

  return (
    <div className="w-full h-full flex flex-col bg-background relative">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 pt-12 pb-32 scroll-smooth">
        <div className="mb-10 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
              GM, {ensName || (address ? address.slice(0, 6) : 'Ser')}
            </h1>
            <p className="text-on-surface-variant font-medium text-lg">
              Portfolio: <span className="text-white font-black">${(totalValue || 0).toLocaleString()}</span>
            </p>
          </div>
          <div className="bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full flex items-center gap-2">
            <Sparkles size={12} className="text-primary" />
            <span className="text-[10px] font-black text-primary uppercase">Agent Active</span>
          </div>
        </div>

        {messages.length === 0 ? (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-2 gap-4">
              <SuggestionCard title="Swap" desc="0.01 ETH to USDC" onClick={() => handleSend("Swap 0.01 ETH to USDC on Base")} />
              <SuggestionCard title="Send" desc="10 USDC to ahmed.eth" onClick={() => handleSend("Send 10 USDC to ahmed.eth")} />
              <SuggestionCard title="Markets" desc="Fetch new markets" onClick={() => handleSend("fetch polymarket new markets")} />
              <SuggestionCard title="KeeperHub" desc="Supply 1 ETH to Aave" onClick={() => handleSend("Supply 1 ETH to Aave")} />
            </div>
            
            <div className="bg-surface-container rounded-3xl p-6 border border-outline-variant/10">
              <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block mb-4">Agent Capabilities</span>
              <div className="space-y-4">
                <CapabilityItem icon={Globe} label="Autonomous Research" desc="Crawl web for real-time market alpha" />
                <CapabilityItem icon={Box} label="Multi-Protocol DeFi" desc="Aave, Uniswap, Safe, Compound" />
                <CapabilityItem icon={TrendingUp} label="Copy Trading" desc="Follow Polymarket whale wallets" />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col gap-3 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-center gap-2 mb-1 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${msg.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white'}`}>
                    {msg.role === 'user' ? <User size={12} /> : <BotIcon size={12} />}
                  </div>
                  <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                    {msg.role === 'user' ? 'You' : 'Molfi AI'}
                  </span>
                </div>
                
                <div className={`max-w-[90%] p-4 rounded-2xl text-xs font-bold leading-relaxed shadow-2xl ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-surface-container border border-outline-variant/10 text-white rounded-tl-none'
                }`}>
                  {msg.content}
                </div>

                {/* Intent Cards */}
                {msg.intent === 'swap' && msg.intentPayload && (
                  <div className="w-full max-w-[95%] mt-2">
                    <SwapCard payload={msg.intentPayload} />
                  </div>
                )}
                {msg.intent === 'send' && msg.intentPayload && (
                  <div className="w-full max-w-[95%] mt-2">
                    <SendCard payload={msg.intentPayload} />
                  </div>
                )}
                {msg.intent === 'polymarket_fetch' && msg.intentPayload && (
                  <div className="w-full max-w-[95%] mt-2">
                    <PolymarketListCard payload={msg.intentPayload} onResearch={triggerResearch} />
                  </div>
                )}
                {msg.intent === 'keeperhub' && msg.intentPayload && (
                  <div className="w-full max-w-[95%] mt-2">
                    <KeeperHubCard payload={msg.intentPayload} />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-3 text-on-surface-variant">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Agent is processing intent...</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent pt-16">
        <div className="bg-surface-container rounded-2xl p-4 border border-outline-variant/10 shadow-2xl relative">
          <div className="flex items-center gap-3 bg-black rounded-xl px-4 py-4 border border-white/10 focus-within:border-primary/40 transition-all shadow-2xl">
            <Plus size={18} className="text-on-surface-variant hover:text-primary cursor-pointer transition-colors" />
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="What should the agent do next?" 
              className="flex-1 bg-transparent text-[11px] font-bold text-white placeholder:text-on-surface-variant/30 focus:outline-none"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                !input.trim() ? 'bg-white/5 text-on-surface-variant' : 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105'
              }`}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CapabilityItem({ icon: Icon, label, desc }: { icon: any, label: string, desc: string }) {
  return (
    <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all">
      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Icon size={14} className="text-primary" />
      </div>
      <div>
        <span className="text-[11px] font-black text-white block mb-0.5">{label}</span>
        <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">{desc}</span>
      </div>
    </div>
  );
}

function SuggestionCard({ title, desc, onClick }: { title: string, desc: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col gap-3 p-5 rounded-3xl bg-surface-container border border-outline-variant/10 hover:border-primary/40 hover:bg-primary/5 transition-all text-left group shadow-xl"
    >
      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-all">
        <Sparkles size={14} className="text-primary" />
      </div>
      <div>
        <span className="text-[10px] font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">{title}</span>
        <span className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest leading-tight mt-1 block">{desc}</span>
      </div>
    </button>
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
