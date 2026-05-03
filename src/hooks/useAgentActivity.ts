import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '../constants/Config';

const API_SOCKET_URL = API_URL.replace('/api', '');

export interface AgentActivity {
  agentId: string;
  type: 'TASK_STARTED' | 'RESEARCH_STARTED' | 'RESEARCH_COMPLETED' | 'TRADE_EXECUTED';
  message: string;
  data?: any;
  timestamp: string;
}

export function useAgentActivity(walletAddress: string | undefined) {
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!walletAddress) return;

    const newSocket = io(API_SOCKET_URL);

    newSocket.on('connect', () => {
      console.log('[Socket] Extension connected to backend');
      newSocket.emit('subscribe', walletAddress);
    });

    newSocket.on('agent_activity', (activity: AgentActivity) => {
      console.log('[Socket] New Agent Activity:', activity);
      setActivities((prev) => [activity, ...prev].slice(0, 50));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [walletAddress]);

  return { activities, socket };
}
