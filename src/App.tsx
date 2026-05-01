import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Sidebar } from './components/Sidebar';
import { ConnectWall } from './components/ConnectWall';
import { Home } from './screens/Home';
import { Wallet } from './screens/Wallet';
import { Discover } from './screens/Discover';
import { History } from './screens/History';
import { Logbook } from './screens/Logbook';
import { Prediction } from './screens/Prediction';
import { Agents } from './screens/Agents';
import { Swap } from './screens/Swap';
import { Profile } from './screens/Profile';
import { AnimatePresence, motion } from 'framer-motion';

type SidebarTab = 'home' | 'history' | 'rewards' | 'wallet' | 'agents' | 'discover' | 'logbook' | 'profile' | 'prediction' | 'swap';

function App() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<SidebarTab>('home');

  if (!isConnected) {
    return <ConnectWall />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home />;
      case 'wallet': return <Wallet onAction={(action) => {
        if (action === 'swap') setActiveTab('swap');
      }} />;
      case 'discover': return <Discover />;
      case 'history': return <History />;
      case 'logbook': return <Logbook />;
      case 'prediction': return <Prediction />;
      case 'agents': return <Agents />;
      case 'swap': return <Swap onBack={() => setActiveTab('wallet')} />;
      case 'profile': return <Profile />;
      default: return <Home />;
    }
  };

  return (
    <div className="flex w-[400px] h-[600px] bg-background text-on-surface select-none overflow-hidden">
      <Sidebar activeTab={activeTab as any} onTabChange={setActiveTab as any} />
      
      <main className="flex-1 h-full overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
