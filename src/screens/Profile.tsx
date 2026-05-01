import { User, ShieldCheck, Bell, Eye, Moon, Globe, CreditCard, HelpCircle, MessageSquare, Info, LogOut, ChevronRight, Wallet as WalletIcon } from 'lucide-react';
import { useAccount, useDisconnect, useEnsName } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';

export function Profile() {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address: address as `0x${string}`, chainId: 1 });
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();

  const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${address || 'molfi'}`;

  return (
    <div className="w-full h-full flex flex-col p-4 gap-6 overflow-y-auto pb-20">
      <div className="flex items-center gap-3 pt-4 px-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <User size={22} />
        </div>
        <h1 className="text-xl font-black text-white uppercase tracking-tight">Profile</h1>
      </div>

      <div className="flex flex-col items-center gap-4 py-8 bg-surface-container rounded-[2.5rem] border border-outline-variant/10 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        
        <div className="relative mb-2">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-outline-variant/20 bg-black/40 p-1">
            <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black border-4 border-surface-container cursor-pointer hover:scale-110 transition-transform" onClick={() => open()}>
            <WalletIcon size={14} />
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 mb-4">
          <h2 className="text-xl font-black text-white tracking-tight">
            {ensName || (isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Not Connected')}
          </h2>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Verified Human</span>
        </div>

        {/* Reown AppKit Account Button */}
        <div className="flex flex-col items-center gap-3 w-full px-8">
           <appkit-button />
           <appkit-network-button />
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <SettingsGroup label="Security & Account">
          <SettingItem icon={ShieldCheck} title="Security Center" subtitle="Biometrics & Recovery" />
          <SettingItem icon={Bell} title="Notifications" subtitle="Trade alerts & News" />
          <SettingItem icon={Eye} title="Privacy" subtitle="Manage visibility" />
        </SettingsGroup>
        <SettingsGroup label="Preferences">
          <SettingItem icon={Moon} title="Appearance" subtitle="Dark Mode" />
          <SettingItem icon={Globe} title="Language" subtitle="English (US)" />
          <SettingItem icon={CreditCard} title="Currency" subtitle="USD ($)" />
        </SettingsGroup>
        <SettingsGroup label="Support">
          <SettingItem icon={HelpCircle} title="Help Center" />
          <SettingItem icon={MessageSquare} title="Contact Support" />
          <SettingItem icon={Info} title="About Molfi" />
        </SettingsGroup>
        <button onClick={() => disconnect()} className="w-full py-4 rounded-2xl border border-red-500/20 text-red-500 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-red-500/5 transition-all active:scale-[0.98]">
          <LogOut size={16} /> Disconnect Wallet
        </button>
      </div>
    </div>
  );
}

function SettingsGroup({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] px-2">{label}</span>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function SettingItem({ icon: Icon, title, subtitle }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container/50 border border-outline-variant/5 hover:bg-white/5 transition-all cursor-pointer group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
          <Icon size={18} />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-black text-white uppercase tracking-tight">{title}</span>
          {subtitle && <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">{subtitle}</span>}
        </div>
      </div>
      <ChevronRight size={16} className="text-on-surface-variant/20 group-hover:text-on-surface-variant transition-colors" />
    </div>
  );
}
