import { useRef, useEffect, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { Network, Zap, User, X, MessageSquare, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SwarmNeuralMapProps {
  agentProfiles: any[];
  simulationLogs: any[];
  isActive: boolean;
}

export function SwarmNeuralMap({ agentProfiles, simulationLogs, isActive }: SwarmNeuralMapProps) {
  const fgRef = useRef<any>(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedAgent, setSelectedAgent] = useState<any>(null);

  useEffect(() => {
    const nodes: any[] = [];
    const links: any[] = [];

    // Central Topic Node
    nodes.push({
      id: "Topic",
      name: "Debate Topic",
      val: 20,
      color: "#c899ff", // Molfi Primary
    });

    agentProfiles.forEach((agent) => {
      nodes.push({
        id: agent.user_id || agent.name,
        name: agent.user_name || agent.name,
        val: 8,
        color: agent.side === 'YES' ? '#c899ff' : '#484848',
        ...agent // Pass through full profile
      });

      links.push({
        source: agent.user_id || agent.name,
        target: "Topic",
        color: "rgba(255,255,255,0.1)",
      });
    });

    // Dynamic links from logs
    simulationLogs.slice(-10).forEach((log) => {
      const agentNode = nodes.find(
        (n) => n.id !== "Topic" && log.msg && log.msg.includes(n.name)
      );

      if (agentNode) {
        agentNode.color = "#ffffff";
        agentNode.val = 12;
      }
    });

    setGraphData({ nodes, links } as any);

    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(-150);
    }
  }, [agentProfiles, simulationLogs]);

  return (
    <div className="w-full h-full relative bg-black/40 rounded-3xl overflow-hidden border border-outline-variant/10 shadow-inner">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
        <Network size={14} className={isActive ? "text-primary animate-pulse" : "text-on-surface-variant"} />
        <span className="text-[9px] font-black uppercase tracking-widest text-white">
          {isActive ? "Live Swarm Map" : "Neural Topology"}
        </span>
      </div>

      {agentProfiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-on-surface-variant/20">
          <Zap size={32} strokeWidth={1} />
          <span className="text-[10px] font-black uppercase tracking-widest">
            Awaiting Initialization
          </span>
        </div>
      ) : (
        <ForceGraph3D
          ref={fgRef}
          graphData={graphData}
          nodeLabel="name"
          nodeColor="color"
          nodeVal="val"
          linkColor="color"
          backgroundColor="rgba(0,0,0,0)"
          width={580} 
          height={320}
          enableNodeDrag={false}
          showNavInfo={false}
          onNodeClick={(node) => {
            if (node.id === "Topic") return;
            setSelectedAgent(node);
          }}
          linkDirectionalParticles={isActive ? 2 : 0}
          linkDirectionalParticleSpeed={0.01}
        />
      )}

      {/* Agent Detail Overlay */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-0 z-50 p-4 bg-black/80 backdrop-blur-xl flex items-center justify-center"
          >
            <div className="w-full max-h-full bg-surface-container rounded-[2rem] border border-primary/20 p-6 flex flex-col gap-4 overflow-y-auto relative shadow-2xl">
              <button 
                onClick={() => setSelectedAgent(null)}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                  <User size={32} />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-xl font-black text-white">{selectedAgent.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${selectedAgent.side === 'YES' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-on-surface-variant'}`}>
                      Side: {selectedAgent.side || 'NEUTRAL'}
                    </span>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-1">
                      <Shield size={10} /> 0G Verified
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare size={12} />
                  Agent Persona
                </span>
                <p className="text-xs font-bold text-on-surface-variant leading-relaxed bg-white/5 p-4 rounded-xl border border-outline-variant/10 italic">
                  "{selectedAgent.persona || "This agent is an expert analyst in decentralized systems and prediction markets, focusing on data-driven consensus."}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 p-3 rounded-xl border border-outline-variant/5">
                  <span className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest">Confidence</span>
                  <div className="text-sm font-black text-white">92%</div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-outline-variant/5">
                  <span className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest">Logic Depth</span>
                  <div className="text-sm font-black text-white">Advanced</div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedAgent(null)}
                className="w-full bg-white text-black py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all mt-2"
              >
                Close Details
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
