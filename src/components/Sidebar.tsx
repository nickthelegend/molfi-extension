import { 
  PlusCircle, 
  History, 
  Gift, 
  Wallet, 
  Bot, 
  Compass, 
  BookText, 
  User,
  TrendingUp,
  Zap,
  Send
} from 'lucide-react';

type SidebarTab = 'home' | 'history' | 'rewards' | 'wallet' | 'agents' | 'discover' | 'logbook' | 'profile' | 'prediction' | 'automations' | 'send';

interface SidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const NavItem = ({ id, icon: Icon, active }: { id: SidebarTab, icon: any, active: boolean }) => (
    <button 
      onClick={() => onTabChange(id)}
      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
        active 
          ? 'bg-primary/20 text-primary' 
          : 'text-on-surface-variant hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon size={20} />
    </button>
  );

  return (
    <div className="w-16 h-full bg-surface-container border-r border-outline-variant/10 flex flex-col items-center py-6 gap-4">
      {/* Logo */}
      <button 
        onClick={() => onTabChange('home')}
        className="w-10 h-10 flex items-center justify-center mb-2 hover:opacity-80 transition-opacity"
      >
        <img src="/logo.png" alt="Molfi" className="w-full h-full object-contain" />
      </button>

      {/* Top Group */}
      <div className="flex flex-col gap-2">
        <NavItem id="home" icon={PlusCircle} active={activeTab === 'home'} />
        <NavItem id="history" icon={History} active={activeTab === 'history'} />
        <NavItem id="rewards" icon={Gift} active={activeTab === 'rewards'} />
      </div>

      <div className="w-8 h-[1px] bg-outline-variant/20 my-2" />

      {/* Middle Group */}
      <div className="flex flex-col gap-2">
        <NavItem id="wallet" icon={Wallet} active={activeTab === 'wallet'} />
        <NavItem id="agents" icon={Bot} active={activeTab === 'agents'} />
        <NavItem id="discover" icon={Compass} active={activeTab === 'discover'} />
        <NavItem id="prediction" icon={TrendingUp} active={activeTab === 'prediction'} />
        <NavItem id="send" icon={Send} active={activeTab === 'send'} />
        <NavItem id="automations" icon={Zap} active={activeTab === 'automations'} />
        <NavItem id="logbook" icon={BookText} active={activeTab === 'logbook'} />
      </div>

      <div className="mt-auto">
        <NavItem id="profile" icon={User} active={activeTab === 'profile'} />
      </div>
    </div>
  );
}
