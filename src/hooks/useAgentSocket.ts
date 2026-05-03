import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '../constants/Config';

export interface AgentActivity {
  agentId: string;
  type: 'TASK_STARTED' | 'TASK_COMPLETED' | 'TRADE_EXECUTED' | 'RESEARCH_READY';
  message: string;
  payload?: any;
  timestamp: Date;
}

export function useAgentSocket(walletAddress?: string) {
  const socketRef = useRef<Socket | null>(null);
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!walletAddress) return;

    const socket = io(API_URL.replace('/api', ''), {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('[Socket] Extension Connected');
      setIsConnected(true);
      socket.emit('subscribe', walletAddress);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('agent_activity', (activity: AgentActivity) => {
      setActivities(prev => [activity, ...prev].slice(0, 20));
      
      // Browser Notification
      if (Notification.permission === 'granted') {
        new Notification('Molfi Agent Update', {
          body: activity.message,
          icon: '/logo.png'
        });
      }
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [walletAddress]);

  return { activities, isConnected };
}
