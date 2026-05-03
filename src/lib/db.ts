import { Dexie, type Table } from 'dexie';

export interface SwarmHistory {
  id?: number;
  marketId: string;
  question: string;
  direction: string;
  confidence: number;
  consensus: string;
  timestamp: number;
  agentProfiles: any[];
  simulationLogs: any[];
}

// Initialize Dexie directly without class inheritance to be ultra-robust against ESM cycle issues
export const db = new Dexie('MolfiDB') as Dexie & {
  swarmHistory: Table<SwarmHistory>;
};

db.version(1).stores({
  swarmHistory: '++id, marketId, timestamp'
});
