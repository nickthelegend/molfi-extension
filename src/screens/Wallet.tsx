import { ArrowDownLeft, RefreshCw, ArrowUpRight, ListFilter, EyeOff } from 'lucide-react';

export function Wallet() {
  return (
    <div className="w-full h-full flex flex-col p-4 gap-4 overflow-y-auto">
      {/* Portfolio Card */}
      <div className="bg-surface-container rounded-[2rem] p-6 border border-outline-variant/10 relative overflow-hidden">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">@No Name</span>
            <EyeOff size={12} className="text-on-surface-variant/40" />
          </div>
        </div>
        
        <div className="flex items-baseline gap-2 mb-8">
          <span className="text-4xl font-black text-white">$0.00</span>
          <span className="text-xs font-bold text-green-400">+0.0%</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <WalletAction icon={ArrowDownLeft} label="Receive" />
          <WalletAction icon={RefreshCw} label="Swap" />
          <WalletAction icon={ArrowUpRight} label="Send" />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-surface-container rounded-[2rem] p-4 border border-outline-variant/10 flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-6">
            <button className="text-xs font-black text-white uppercase tracking-wider relative">
              Tokens
              <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-primary" />
            </button>
            <button className="text-xs font-bold text-on-surface-variant uppercase tracking-wider hover:text-white transition-colors">
              Collectables
            </button>
          </div>
          <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-on-surface-variant">
            <ListFilter size={16} />
          </button>
        </div>

        {/* Token List */}
        <div className="flex flex-col gap-2">
          <TokenItem 
            name="Solana" 
            symbol="SOL" 
            balance="0.000" 
            value="$0.00" 
            change="+0.00%" 
            color="text-green-400"
            icon="https://cryptologos.cc/logos/solana-sol-logo.png"
          />
          <TokenItem 
            name="USD Coin" 
            symbol="USDC" 
            balance="0.00" 
            value="$0.00" 
            change="+0.00%" 
            color="text-green-400"
            icon="https://cryptologos.cc/logos/usd-coin-usdc-logo.png"
          />
          <TokenItem 
            name="Tether" 
            symbol="USDT" 
            balance="0.00" 
            value="$0.00" 
            change="+0.00%" 
            color="text-green-400"
            icon="https://cryptologos.cc/logos/tether-usdt-logo.png"
          />
          <TokenItem 
            name="MOLFI AI" 
            symbol="MOLFI" 
            balance="0.00" 
            value="$0.00" 
            change="+0.00%" 
            color="text-green-400"
            icon="/logo.png"
          />
        </div>
      </div>
    </div>
  );
}

function WalletAction({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <button className="flex flex-col items-center gap-2 group">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white border border-outline-variant/10 group-hover:bg-primary/20 group-hover:border-primary/40 group-hover:text-primary transition-all">
        <Icon size={20} />
      </div>
      <span className="text-[10px] font-bold text-on-surface-variant group-hover:text-white uppercase tracking-widest">{label}</span>
    </button>
  );
}

function TokenItem({ name, symbol, balance, value, change, color, icon }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-outline-variant/5 hover:bg-white/10 transition-all cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center overflow-hidden">
          <img src={icon} alt={name} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-black text-white">{name}</span>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{balance} {symbol}</span>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-sm font-black text-white">{value}</span>
        <span className={`text-[10px] font-bold ${color}`}>{change}</span>
      </div>
    </div>
  );
}
