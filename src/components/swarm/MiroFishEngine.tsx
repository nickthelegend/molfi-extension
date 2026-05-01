import { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  Sparkles, 
  Terminal,
  BarChart3
} from 'lucide-react';
import { SwarmNeuralMap } from './SwarmNeuralMap';
import { db } from '../../lib/db';

const API_BASE = "http://localhost:5001";

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

  useEffect(() => {
    if (!isRunning && currentStep === 1 && question) {
      startSwarm();
    }
  }, [question]);

  const addLog = (msg: string, type: "info" | "success" | "warning" | "error" | "system" = "info") => {
    setLogs((prev) => [...prev, { 
      msg: `[${new Date().toLocaleTimeString()}] ${msg}`,
      type 
    }]);
  };

  const [projectId, setProjectId] = useState<string | null>(null);
  const [graphId, setGraphId] = useState<string | null>(null);
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
      setProjectId(pId);
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
      
      // Poll Graph
      const gResult = await pollTask(`${API_BASE}/api/graph/task/`, buildData.data.task_id);
      const gId = gResult.result?.graph_id || gResult.graph_id;
      setGraphId(gId);
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
      
      // Poll Prepare Status
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

      // Poll Run Status
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

      setPrediction({
        direction,
        confidence,
        consensus: summary.substring(0, 200) + "..."
      });

      // Save to IndexedDB
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
               Swarm Output {simulationId && `(ID: ${simulationId.slice(0,6)})`}
             </div>
             {projectId && <div className="text-[8px] opacity-30 absolute bottom-2 right-4">P: {projectId.slice(0,6)} | G: {graphId?.slice(0,6)}</div>}
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
