import Dexie, { type Table } from 'dexie';

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

export class MolfiDatabase extends Dexie {
  swarmHistory!: Table<SwarmHistory>;

  constructor() {
    super('MolfiDB');
    this.version(1).stores({
      swarmHistory: '++id, marketId, timestamp'
    });
  }
}

export const db = new MolfiDatabase();
