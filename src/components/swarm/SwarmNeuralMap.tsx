import { useRef, useEffect, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { Network, Zap } from 'lucide-react';

interface SwarmNeuralMapProps {
  agentProfiles: any[];
  simulationLogs: any[];
  isActive: boolean;
}

export function SwarmNeuralMap({ agentProfiles, simulationLogs, isActive }: SwarmNeuralMapProps) {
  const fgRef = useRef<any>(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

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
          width={368} // Optimized for 400px extension (with padding)
          height={300}
          enableNodeDrag={false}
          showNavInfo={false}
          linkDirectionalParticles={isActive ? 2 : 0}
          linkDirectionalParticleSpeed={0.01}
        />
      )}
    </div>
  );
}
