import { useAppKit } from '@reown/appkit/react';
import { LayoutDashboard, Wallet as WalletIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export function ConnectWall() {
  const { open } = useAppKit();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-background relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="w-20 h-20 rounded-[2rem] bg-primary flex items-center justify-center mb-8 shadow-2xl primary-glow">
          <LayoutDashboard size={40} className="text-on-primary" />
        </div>

        <h1 className="text-3xl font-black text-white mb-4 tracking-tight uppercase">Molfi</h1>
        <p className="text-on-surface-variant font-medium mb-12 leading-relaxed">
          The most profitable way to trade.<br />Connect your wallet to start pumping.
        </p>

        <button 
          onClick={() => open()}
          className="w-full bg-primary text-on-primary py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 primary-glow hover:opacity-90 transition-all active:scale-95"
        >
          <WalletIcon size={18} />
          Connect Wallet
        </button>
      </motion.div>

      <div className="absolute bottom-8 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">
        Powered by 0G Ethereum
      </div>
    </div>
  );
}
