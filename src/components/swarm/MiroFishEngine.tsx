import { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  Sparkles, 
  Terminal,
  BarChart3
} from 'lucide-react';
import { SwarmNeuralMap } from './SwarmNeuralMap';
import { db } from '../../lib/db';

interface MiroFishEngineProps {
  marketId: string;
  question: string;
}

export function MiroFishEngine({ marketId, question }: MiroFishEngineProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [logs, setLogs] = useState<{ msg: string; type: "info" | "success" | "warning" | "error" | "system" }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [agentProfiles, setAgentProfiles] = useState<any[]>([]);
  const [simulationLogs, setSimulationLogs] = useState<any[]>([]);
  const [prediction, setPrediction] = useState<any>(null);
  const [prepareProgress, setPrepareProgress] = useState(0);

  const addLog = (msg: string, type: "info" | "success" | "warning" | "error" | "system" = "info") => {
    setLogs((prev) => [...prev, { 
      msg: `[${new Date().toLocaleTimeString()}] ${msg}`,
      type 
    }]);
  };

  const startSwarm = async () => {
    setIsRunning(true);
    addLog("Initializing MiroFish Orchestration Engine...", "system");
    addLog("Establishing connection to 0G Swarm Cluster...", "info");

    try {
      // Step 1: Research & Ontology
      setCurrentStep(1);
      addLog("Analyzing market sentiment and reality seeds...", "info");
      await delay(2000);
      addLog("Ontology generated. Building Knowledge Graph...", "success");

      // Step 2: Build Graph
      setCurrentStep(2);
      addLog("Mapping Graph RAG to Vector DB...", "info");
      await delay(2000);
      addLog("Neural topology established.", "success");

      // Step 3: Personas
      setCurrentStep(3);
      addLog("Generating Agent Personas...", "info");
      const mockProfiles = Array.from({ length: 12 }).map((_, i) => ({
        user_id: `agent_${i}`,
        name: `Agent ${i}`,
        side: i % 2 === 0 ? 'YES' : 'NO',
        persona: "Expert Analyst"
      }));
      
      for(let i=0; i<=100; i+=20) {
        setPrepareProgress(i);
        await delay(500);
      }
      setAgentProfiles(mockProfiles);
      addLog(`${mockProfiles.length} agents materialized in the swarm.`, "success");

      // Step 4: Simulation
      setCurrentStep(4);
      addLog("Swarm active. Beginning cross-agent debate...", "system");
      
      for(let i=0; i<10; i++) {
        const newLog = { msg: `Agent ${i} argues for ${i % 2 === 0 ? 'YES' : 'NO'} based on ${i % 3 === 0 ? 'market data' : 'sentiment'}.` };
        setSimulationLogs(prev => [...prev, newLog]);
        await delay(1000);
      }

      // Step 5: Report
      setCurrentStep(5);
      addLog("Debate convergence detected. Generating report...", "info");
      await delay(2000);
      setPrediction({
        direction: "YES",
        confidence: 84,
        consensus: "Agents converged on YES after 40 rounds of debate, citing strong 0G root data."
      });

      // Save to IndexedDB
      await db.swarmHistory.add({
        marketId,
        question,
        direction: "YES",
        confidence: 84,
        consensus: "Agents converged on YES after 40 rounds of debate, citing strong 0G root data.",
        timestamp: Date.now(),
        agentProfiles: mockProfiles,
        simulationLogs: [
          { msg: "Agent 0 argues for YES based on market data." },
          { msg: "Agent 1 argues for NO based on sentiment." },
          // ... truncated for mock
        ]
      });

      addLog("Consensus reached. Swarm finalized.", "success");

    } catch (err: any) {
      addLog(`Fatal error: ${err.message}`, "error");
    } finally {
      setIsRunning(false);
    }
  };

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Steps Progress */}
      <div className="grid grid-cols-5 gap-1 shrink-0">
        <StepIndicator step={1} active={currentStep >= 1} current={currentStep === 1} label="Map" />
        <StepIndicator step={2} active={currentStep >= 2} current={currentStep === 2} label="Graph" />
        <StepIndicator step={3} active={currentStep >= 3} current={currentStep === 3} label="Swarm" />
        <StepIndicator step={4} active={currentStep >= 4} current={currentStep === 4} label="Run" />
        <StepIndicator step={5} active={currentStep >= 5} current={currentStep === 5} label="Result" />
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-y-auto pr-1">
        {/* Graph / UI Container */}
        <div className="h-[300px] shrink-0">
          <SwarmNeuralMap agentProfiles={agentProfiles} simulationLogs={simulationLogs} isActive={currentStep === 4} />
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col gap-4">
          {currentStep < 5 ? (
            <div className="bg-surface-container rounded-[2rem] p-6 border border-outline-variant/10 flex flex-col items-center justify-center text-center gap-4 min-h-[150px]">
              {isRunning ? (
                <>
                  <Loader2 className="text-primary animate-spin" size={32} />
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-black text-white uppercase tracking-widest">
                      {currentStep === 3 ? `Materializing Swarm (${prepareProgress}%)` : 'Orchestrating...'}
                    </span>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                      Current: Phase {currentStep}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <Sparkles size={32} />
                  </div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase leading-relaxed px-4">
                    Ready to deploy 100+ AI agents to solve: <br/>
                    <span className="text-white">"{question}"</span>
                  </p>
                  <button 
                    onClick={startSwarm}
                    className="mt-2 bg-white text-black px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all active:scale-95"
                  >
                    Launch Swarm
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="bg-primary/10 rounded-[2rem] p-6 border border-primary/20 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-between">
                 <div className="flex flex-col">
                   <span className="text-[10px] font-black text-primary uppercase tracking-widest">Consensus Outcome</span>
                   <span className="text-3xl font-black text-white">{prediction?.direction}</span>
                 </div>
                 <div className="w-16 h-16 rounded-full border-4 border-primary/30 flex items-center justify-center relative">
                   <span className="text-xs font-black text-white">{prediction?.confidence}%</span>
                   <div className="absolute inset-0 border-4 border-primary rounded-full" style={{ clipPath: `inset(0 ${100-prediction?.confidence}% 0 0)` }} />
                 </div>
               </div>
               <p className="text-xs font-bold text-on-surface-variant leading-relaxed italic">
                 "{prediction?.consensus}"
               </p>
               <button className="w-full bg-white text-black py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                 <BarChart3 size={14} />
                 Trade Outcome
               </button>
            </div>
          )}

          {/* Terminal Logs */}
          <div className="bg-black/40 rounded-2xl p-4 border border-outline-variant/5 font-mono flex-1 min-h-[150px]">
             <div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10 pb-2">
               <Terminal size={12} />
               Swarm Output
             </div>
             <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[120px] scrollbar-hide">
               {logs.map((log, i) => (
                 <div key={i} className={`text-[9px] leading-tight ${
                   log.type === 'success' ? 'text-primary' : 
                   log.type === 'error' ? 'text-red-400' : 
                   log.type === 'system' ? 'text-white font-bold' : 'text-on-surface-variant'
                 }`}>
                   {log.msg}
                 </div>
               ))}
               <div className="h-4" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ active, current, label }: any) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-full h-1 rounded-full transition-all duration-500 ${
        current ? 'bg-primary shadow-[0_0_10px_rgba(200,153,255,0.5)]' : 
        active ? 'bg-primary/40' : 'bg-white/5'
      }`} />
      <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-colors ${
        active ? 'text-white' : 'text-on-surface-variant/40'
      }`}>
        {label}
      </span>
    </div>
  );
}
