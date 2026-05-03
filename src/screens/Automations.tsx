import { useState, useEffect } from 'react';
import { keeperHub } from '../utils/keeperhub';
import { useAccount } from 'wagmi';
import { Plus, Trash2, Zap, Play, Pause, AlertCircle, Loader2, BarChart3, ShieldCheck } from 'lucide-react';
import { API_URL } from '../constants/Config';

const TEMPLATES = [
  {
    id: 'balance-alert',
    name: 'Balance Alert',
    icon: <ShieldCheck className="w-5 h-5" />,
    description: 'Notify when ETH balance drops below threshold',
    config: (address: string) => ({
      name: 'ETH Balance Watch',
      description: 'Notifies the Molfi App via push when balance < 0.1 ETH',
      nodes: [
        { id: 'trigger-1', type: 'trigger', data: { label: 'Every hour', config: { triggerType: 'Schedule', interval: 'hourly' } } },
        { id: 'check-balance', type: 'action', data: { label: 'Check Balance', config: { actionType: 'web3/check-balance', network: '1', address } } },
        { id: 'condition-1', type: 'condition', data: { label: 'Below 0.1 ETH', config: { operator: '<', value: '0.1', field: '{{@check-balance:Balance.value}}' } } },
        { id: 'notify-webhook', type: 'action', data: { label: 'Notify Molfi', config: { actionType: 'webhook/send', url: `${API_URL}/keeperhub/webhook`, method: 'POST', body: JSON.stringify({ walletAddress: address, title: 'Low Balance Alert', message: 'Your ETH balance is below 0.1 ETH' }) } } }
      ],
      edges: [
        { id: 'e1', source: 'trigger-1', target: 'check-balance' },
        { id: 'e2', source: 'check-balance', target: 'condition-1' },
        { id: 'e3', source: 'condition-1', target: 'notify-webhook', sourceHandle: 'true' }
      ]
    })
  },
  {
    id: 'contract-monitor',
    name: 'Supply Tracker',
    icon: <BarChart3 className="w-5 h-5" />,
    description: 'Monitor token supply changes',
    config: (address: string) => ({
      name: 'USDT Supply Tracker',
      description: 'Monitors USDT total supply and notifies on changes',
      nodes: [
        { id: 'trigger-1', type: 'trigger', data: { label: 'Every hour', config: { triggerType: 'Schedule', interval: 'hourly' } } },
        { id: 'read-contract', type: 'action', data: { label: 'Read Total Supply', config: { actionType: 'web3/read-contract', network: '1', contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7', functionName: 'totalSupply' } } },
        { id: 'notify-webhook', type: 'action', data: { label: 'Notify Molfi', config: { actionType: 'webhook/send', url: `${API_URL}/keeperhub/webhook`, method: 'POST', body: JSON.stringify({ walletAddress: address, title: 'Contract Update', message: 'USDT Total Supply updated.' }) } } }
      ],
      edges: [
        { id: 'e1', source: 'trigger-1', target: 'read-contract' },
        { id: 'e2', source: 'read-contract', target: 'notify-webhook' }
      ]
    })
  }
];

export function Automations() {
  const { address } = useAccount();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [wfRes, intRes] = await Promise.all([
        keeperHub.listWorkflows(),
        keeperHub.listIntegrations('web3')
      ]);
      if (wfRes.data) setWorkflows(wfRes.data);
      if (intRes.data) setIntegrations(intRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const createFromTemplate = async (template: any) => {
    if (!address) return;
    setIsCreating(true);
    try {
      const config = template.config(address);
      await keeperHub.createWorkflow({
        ...config,
        enabled: true
      });
      await fetchData();
    } catch (err: any) {
      alert(`Failed to create workflow: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const deleteWorkflow = async (id: string) => {
    if (!confirm('Delete this automation?')) return;
    try {
      await keeperHub.deleteWorkflow(id);
      setWorkflows(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="flex flex-col h-full bg-background p-6 overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Automations</h1>
          <p className="text-on-surface-variant/60 text-sm mt-1">Execute on-chain strategies 24/7</p>
        </div>
        <button 
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl font-bold hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
          onClick={() => createFromTemplate(TEMPLATES[0])}
          disabled={isCreating}
        >
          {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          Quick Alert
        </button>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-on-surface">
            <Zap className="w-5 h-5 text-primary" />
            Active Workflows
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
              </div>
            ) : workflows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-outline-variant/30 rounded-3xl bg-surface-variant/5">
                <p className="text-on-surface-variant/60 text-sm">No active workflows</p>
              </div>
            ) : (
              workflows.map(wf => (
                <div key={wf.id} className="p-5 bg-surface-variant/20 rounded-3xl border border-outline-variant/20 hover:border-primary/30 transition-all group">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <Zap className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{wf.name}</h3>
                        <p className="text-on-surface-variant/60 text-sm line-clamp-1">{wf.description}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${wf.enabled ? 'bg-success/10 text-success' : 'bg-on-surface-variant/10 text-on-surface-variant/60'}`}>
                            {wf.enabled ? 'Active' : 'Paused'}
                          </span>
                          <span className="text-[11px] text-on-surface-variant/40">Last run: {wf.lastRunAt ? new Date(wf.lastRunAt).toLocaleDateString() : 'Never'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => deleteWorkflow(wf.id)} className="p-2 text-error/60 hover:text-error hover:bg-error/10 rounded-xl transition-all">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-on-surface">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Agentic Wallets
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {integrations.length === 0 ? (
              <div className="p-6 bg-surface-variant/10 rounded-3xl border border-outline-variant/10">
                <p className="text-sm text-on-surface-variant/60">No wallets integrated. Add one in the KeeperHub dashboard to enable on-chain actions.</p>
              </div>
            ) : (
              integrations.map(int => (
                <div key={int.id} className="flex items-center justify-between p-4 bg-surface-variant/10 rounded-2xl border border-outline-variant/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {int.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{int.name}</p>
                      <p className="text-[11px] text-on-surface-variant/40 font-mono">{int.config?.address}</p>
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-primary/10 rounded-lg text-[10px] text-primary font-bold">
                    CONNECTED
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-on-surface">
            <AlertCircle className="w-5 h-5 text-primary" />
            Ready-to-use Templates
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {TEMPLATES.map(t => (
              <div 
                key={t.id} 
                className="p-6 bg-surface-variant/10 rounded-3xl border border-outline-variant/10 hover:border-primary/40 cursor-pointer transition-all group active:scale-[0.98]" 
                onClick={() => createFromTemplate(t)}
              >
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                  {t.icon}
                </div>
                <h4 className="font-bold mb-1">{t.name}</h4>
                <p className="text-xs text-on-surface-variant/60 leading-relaxed">{t.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
