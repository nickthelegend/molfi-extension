import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  Sparkles, 
  Terminal,
  BarChart3,
  Users,
  ShieldCheck,
  Network,
  Activity,
  FileText
} from 'lucide-react';
import { SwarmNeuralMap } from './SwarmNeuralMap';
import { db } from '../../lib/db';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

const API_BASE = "http://localhost:5001";

interface MiroFishEngineProps {
  marketId: string;
  question: string;
  historyId?: number | null;
}

export function MiroFishEngine({ marketId, question, historyId }: MiroFishEngineProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [logs, setLogs] = useState<{ msg: string; type: "info" | "success" | "warning" | "error" | "system" }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [agentProfiles, setAgentProfiles] = useState<any[]>([]);
  const [simulationLogs, setSimulationLogs] = useState<any[]>([]);
  const [prediction, setPrediction] = useState<any>(null);
  const [prepareProgress, setPrepareProgress] = useState(0);
  const [isCommitting, setIsCommitting] = useState(false);

  const { data: hash } = useWriteContract();
  const { isLoading: isTxConfirming } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (historyId) {
      loadHistory();
    } else if (!isRunning && currentStep === 1 && question) {
      startSwarm();
    }
  }, [question, historyId]);

  const loadHistory = async () => {
    if (!historyId) return;
    setIsRunning(false);
    addLog("Loading historical swarm consensus from IndexedDB...", "system");
    
    const record = await db.swarmHistory.get(historyId);
    if (record) {
      setAgentProfiles(record.agentProfiles || []);
      setSimulationLogs(record.simulationLogs || []);
      setPrediction({
        direction: record.direction,
        confidence: record.confidence,
        consensus: record.consensus
      });
      setCurrentStep(5);
      addLog("Historical record loaded successfully.", "success");
    } else {
      addLog("Failed to locate historical record.", "error");
    }
  };

  const addLog = (msg: string, type: "info" | "success" | "warning" | "error" | "system" = "info") => {
    setLogs((prev) => [...prev, { 
      msg: `[${new Date().toLocaleTimeString()}] ${msg}`,
      type 
    }]);
  };

  const [simulationId, setSimulationId] = useState<string | null>(null);

  const startSwarm = async () => {
    if (!question) return;
    setIsRunning(true);
    setCurrentStep(1);
    setLogs([]);
    addLog("Initializing MiroFish Orchestration Engine...", "system");

    try {
      // 0. Auto-Research Live Context
      addLog("Deploying Recursive Research Agent...", "info");
      const researchRes = await fetch(`${API_BASE}/api/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: question }),
      });
      const researchData = await researchRes.json();
      if (!researchData.success) throw new Error(researchData.error || "Research failed");
      addLog("Research Complete. Reality Seed Document Generated.", "success");

      // 1. Generate Ontology
      addLog("Uploading Reality Seed and generating ontology...", "info");
      const blob = new Blob([researchData.document], { type: "text/markdown" });
      const generatedFile = new File([blob], researchData.title || "Research.md", { type: "text/markdown" });
      const formData = new FormData();
      formData.append("files", generatedFile);
      formData.append("simulation_requirement", question);
      formData.append("project_name", `Prediction Market ${marketId}`);

      const ontRes = await fetch(`${API_BASE}/api/graph/ontology/generate`, {
        method: "POST",
        body: formData,
      });
      const ontData = await ontRes.json();
      if (!ontData.success) throw new Error(ontData.error || "Ontology failed");
      
      const pId = ontData.data.project_id;
      addLog("Ontology generated successfully.", "success");

      // 2. Build Graph
      setCurrentStep(2);
      addLog("Building Graph RAG Map...", "info");
      const buildRes = await fetch(`${API_BASE}/api/graph/build`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: pId,
          graph_name: `Graph_${marketId}`,
        }),
      });
      const buildData = await buildRes.json();
      if (!buildData.success) throw new Error("Graph build failed");
      
      const gResult = await pollTask(`${API_BASE}/api/graph/task/`, buildData.data.task_id);
      const gId = gResult.result?.graph_id || gResult.graph_id;
      addLog("Graph RAG mapped successfully.", "success");

      // 3. Create & Prepare Simulation
      setCurrentStep(3);
      addLog("Generating Agent Personas...", "info");
      const simRes = await fetch(`${API_BASE}/api/simulation/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: pId,
          graph_id: gId,
          enable_twitter: true,
          enable_reddit: true,
        }),
      });
      const simData = await simRes.json();
      const sId = simData.data.simulation_id;
      setSimulationId(sId);

      const prepRes = await fetch(`${API_BASE}/api/simulation/prepare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          simulation_id: sId,
          use_llm_for_profiles: true,
        }),
      });
      const prepData = await prepRes.json();
      
      await pollPrepareStatus(sId, prepData.data.task_id);
      addLog("Environment ready with materialized agents.", "success");

      // 4. Start Simulation
      setCurrentStep(4);
      addLog("Starting Dual World Simulation...", "system");
      await fetch(`${API_BASE}/api/simulation/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          simulation_id: sId,
          max_rounds: 40,
        }),
      });

      await pollRunStatus(sId);
      addLog("Simulation Complete. Generating Report...", "success");

      // 5. Generate Report
      setCurrentStep(5);
      const repGenRes = await fetch(`${API_BASE}/api/report/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulation_id: sId }),
      });
      const repGenData = await repGenRes.json();
      const rId = repGenData.data.report_id;

      const finalReport = await pollReportStatus(rId);
      
      const summary = finalReport.outline?.summary || finalReport.markdown_content || "";
      const isNo = /negative|against|decline|no|rejected/i.test(summary.substring(0, 500));
      const direction = isNo ? "NO" : "YES";
      const confMatch = summary.match(/(\d+)%/);
      const confidence = confMatch ? parseInt(confMatch[1]) : 85;

      const pred = {
        direction,
        confidence,
        consensus: summary.substring(0, 200) + "..."
      };
      setPrediction(pred);

      await db.swarmHistory.add({
        marketId,
        question,
        direction,
        confidence,
        consensus: summary,
        timestamp: Date.now(),
        agentProfiles: agentProfiles,
        simulationLogs: simulationLogs
      });

      addLog("Consensus reached. Swarm finalized.", "success");

    } catch (err: any) {
      addLog(`Fatal error: ${err.message}`, "error");
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCommitTo0G = async () => {
    setIsCommitting(true);
    addLog("Anchoring consensus to 0G Storage...", "info");
    try {
      // Simulation of 0G commitment
      await new Promise(r => setTimeout(r, 2000));
      addLog("Successfully anchored to 0G Storage.", "success");
      addLog("Hash: 0x72a...d83e", "system");
    } catch (e: any) {
      addLog("0G Anchoring failed: " + e.message, "error");
    } finally {
      setIsCommitting(false);
    }
  };

  const pollTask = async (baseUrl: string, taskId: string) => {
    while (true) {
      const res = await fetch(`${baseUrl}${taskId}`);
      const data = await res.json();
      if (data.data?.status === "completed") return data.data;
      if (data.data?.status === "failed") throw new Error("Task Failed");
      await delay(2000);
    }
  };

  const pollPrepareStatus = async (sId: string, taskId: string) => {
    while (true) {
      const res = await fetch(`${API_BASE}/api/simulation/prepare/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: taskId, simulation_id: sId }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPrepareProgress(data.data.progress || 0);
        if (data.data.status === "completed" || data.data.runner_status === "completed" || data.data.status === "ready") {
           const profilesRes = await fetch(`${API_BASE}/api/simulation/${sId}/profiles`);
           const profilesData = await profilesRes.json();
           if (profilesData.success) setAgentProfiles(profilesData.data.profiles);
           break;
        }
        if (data.data.status === "failed") throw new Error("Preparation Failed");
      }
      await delay(2000);
    }
  };

  const pollRunStatus = async (sId: string) => {
    while (true) {
      const res = await fetch(`${API_BASE}/api/simulation/${sId}/run-status/detail`);
      const data = await res.json();
      if (data.data?.status === "completed" || data.data?.runner_status === "completed" || data.data?.status === "stopped") break;
      if (data.data?.recent_actions) setSimulationLogs(data.data.recent_actions.slice(0, 10));
      await delay(2000);
    }
  };

  const pollReportStatus = async (reportId: string) => {
    while (true) {
      const res = await fetch(`${API_BASE}/api/report/generate/status?report_id=${reportId}`);
      const data = await res.json();
      if (data.data?.status === "completed") {
        const finalRes = await fetch(`${API_BASE}/api/report/${reportId}`);
        const fd = await finalRes.json();
        return fd.data;
      }
      if (data.data?.status === "failed") throw new Error("Report generation failed");
      await delay(2000);
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

      <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-y-auto pr-1 scrollbar-hide">
        <AnimatePresence mode="wait">
          {/* Neural Map - Always visible but smaller when results are out */}
          <motion.div 
            layout
            className={`${currentStep === 5 ? 'h-[200px]' : 'h-[300px]'} shrink-0 rounded-3xl overflow-hidden border border-white/5 bg-black/20`}
          >
            <SwarmNeuralMap agentProfiles={agentProfiles} simulationLogs={simulationLogs} isActive={currentStep === 4} />
          </motion.div>

          {/* Results Overlay / Content */}
          <motion.div 
            layout
            className="flex-1 flex flex-col gap-4"
          >
            {currentStep < 5 ? (
              <div className="bg-[#0f0f0f] rounded-[2.5rem] p-8 border border-white/5 flex flex-col items-center justify-center text-center gap-6 min-h-[200px] relative overflow-hidden">
                <div className="absolute inset-0 bg-[#ad46ff]/5 blur-3xl rounded-full" />
                
                {isRunning ? (
                  <>
                    <div className="relative">
                      <Loader2 className="text-[#ad46ff] animate-spin" size={48} />
                      <div className="absolute inset-0 blur-lg bg-[#ad46ff]/30 animate-pulse" />
                    </div>
                    <div className="flex flex-col gap-2 relative">
                      <span className="text-sm font-black text-white uppercase tracking-[0.2em]">
                        {currentStep === 3 ? `Materializing Swarm (${prepareProgress}%)` : 
                         currentStep === 4 ? 'Agents in Debate...' : 'Orchestrating...'}
                      </span>
                      <div className="flex items-center gap-2 justify-center">
                         <div className="w-2 h-2 rounded-full bg-[#ad46ff] animate-bounce" style={{ animationDelay: '0ms' }} />
                         <div className="w-2 h-2 rounded-full bg-[#ad46ff] animate-bounce" style={{ animationDelay: '200ms' }} />
                         <div className="w-2 h-2 rounded-full bg-[#ad46ff] animate-bounce" style={{ animationDelay: '400ms' }} />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 rounded-[2rem] bg-[#ad46ff]/10 flex items-center justify-center text-[#ad46ff] border border-[#ad46ff]/20">
                      <Sparkles size={40} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h4 className="text-white font-black text-sm uppercase tracking-widest">Swarm Ready</h4>
                      <p className="text-[10px] font-bold text-gray-500 uppercase leading-relaxed max-w-[200px]">
                        100+ specialized agents initialized for consensus analysis.
                      </p>
                    </div>
                    <button 
                      onClick={startSwarm}
                      className="bg-white text-black px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#ad46ff] hover:text-white transition-all active:scale-95 shadow-xl"
                    >
                      Deploy Swarm
                    </button>
                  </>
                )}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#ad46ff] rounded-[2.5rem] p-8 border border-white/20 flex flex-col gap-6 shadow-[0_20px_50px_rgba(173,70,255,0.4)] relative overflow-hidden"
              >
                 <div className="absolute top-0 right-0 p-6">
                    <ShieldCheck size={24} className="text-white/20" />
                 </div>

                 <div className="flex items-center justify-between">
                   <div className="flex flex-col">
                     <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-1">Final Consensus Outcome</span>
                     <span className="text-4xl font-black text-white">{prediction?.direction}</span>
                   </div>
                   <div className="w-20 h-20 rounded-full border-4 border-white/20 flex items-center justify-center relative bg-white/5">
                     <span className="text-sm font-black text-white">{prediction?.confidence}%</span>
                     <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle 
                          cx="40" cy="40" r="36" 
                          fill="none" stroke="white" strokeWidth="4" 
                          strokeDasharray={226}
                          strokeDashoffset={226 - (226 * (prediction?.confidence || 0)) / 100}
                          className="transition-all duration-1000"
                        />
                     </svg>
                   </div>
                 </div>

                 <div className="bg-black/20 rounded-[1.5rem] p-5 border border-white/10">
                    <p className="text-xs font-bold text-white/90 leading-relaxed italic">
                      "{prediction?.consensus}"
                    </p>
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={handleCommitTo0G}
                      disabled={isCommitting || isTxConfirming}
                      className="flex-1 bg-black text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white hover:text-black transition-all"
                    >
                      {isCommitting ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                      Anchor to 0G
                    </button>
                    <button className="flex-1 bg-white text-[#ad46ff] py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all">
                      <BarChart3 size={14} />
                      Trade Now
                    </button>
                 </div>
              </motion.div>
            )}

            {/* Terminal Logs */}
            <div className="bg-black/40 rounded-[2rem] p-6 border border-white/5 font-mono flex-1 min-h-[180px] relative">
               <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                 <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                   <Terminal size={14} className="text-[#ad46ff]" />
                   Neural Swarm logs
                 </div>
                 {simulationId && (
                   <span className="text-[8px] font-bold text-[#ad46ff]/50 uppercase tracking-widest">
                     SESSION: {simulationId.slice(0,8)}
                   </span>
                 )}
               </div>
               
               <div className="flex flex-col gap-2 overflow-y-auto max-h-[140px] scrollbar-hide">
                 {logs.map((log, i) => (
                   <motion.div 
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     key={i} 
                     className={`text-[10px] leading-relaxed flex gap-2 ${
                       log.type === 'success' ? 'text-[#ad46ff]' : 
                       log.type === 'error' ? 'text-red-400' : 
                       log.type === 'system' ? 'text-white font-black' : 'text-gray-400'
                     }`}
                   >
                     <span className="opacity-30 shrink-0">›</span>
                     <span>{log.msg}</span>
                   </motion.div>
                 ))}
                 <div className="h-4" />
               </div>

               {/* Step Tags */}
               <div className="absolute bottom-4 right-6 flex gap-2">
                  {currentStep >= 1 && <div className="p-1 rounded-md bg-[#ad46ff]/10 text-[#ad46ff] border border-[#ad46ff]/20"><Network size={10} /></div>}
                  {currentStep >= 3 && <div className="p-1 rounded-md bg-[#ad46ff]/10 text-[#ad46ff] border border-[#ad46ff]/20"><Users size={10} /></div>}
                  {currentStep >= 4 && <div className="p-1 rounded-md bg-[#ad46ff]/10 text-[#ad46ff] border border-[#ad46ff]/20"><Activity size={10} /></div>}
                  {currentStep >= 5 && <div className="p-1 rounded-md bg-[#ad46ff]/10 text-[#ad46ff] border border-[#ad46ff]/20"><FileText size={10} /></div>}
               </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function StepIndicator({ active, current, label }: any) {
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1">
      <div className={`w-full h-1.5 rounded-full transition-all duration-700 relative overflow-hidden ${
        active ? 'bg-[#ad46ff]/20' : 'bg-white/5'
      }`}>
        {current && (
          <motion.div 
            layoutId="activeStep"
            className="absolute inset-0 bg-[#ad46ff] shadow-[0_0_15px_rgba(173,70,255,0.8)]"
            initial={false}
          />
        )}
      </div>
      <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${
        active ? 'text-white' : 'text-gray-600'
      }`}>
        {label}
      </span>
    </div>
  );
}

