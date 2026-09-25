'use client';

import React, { useState } from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { Button } from '../ui/Button';
import { 
  Network, 
  Sparkles, 
  X, 
  AlertTriangle, 
  ArrowRight, 
  Zap, 
  ShieldAlert,
  Layers,
  CheckCircle2
} from 'lucide-react';

interface CascadeNode {
  id: string;
  label: string;
  type: 'upstream_trigger' | 'intermediate_service' | 'business_impact';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  exposureUsd: number;
  status: 'Active Threat' | 'Mitigated' | 'Normal';
}

interface CascadeLink {
  from: string;
  to: string;
  propagationLatency: string;
}

export const CascadePropagationGraph: React.FC = () => {
  const { risks, formatCurrency, addToast } = useRiskContext();

  const [activeTrigger, setActiveTrigger] = useState<string>('RSK-101');

  const nodes: CascadeNode[] = [
    {
      id: 'RSK-101',
      label: 'Database Connection Pool Lock',
      type: 'upstream_trigger',
      severity: 'Critical',
      exposureUsd: 150000,
      status: 'Active Threat'
    },
    {
      id: 'SVC-API',
      label: 'API Gateway Timeout & 504 Error Spike',
      type: 'intermediate_service',
      severity: 'High',
      exposureUsd: 85000,
      status: 'Active Threat'
    },
    {
      id: 'SVC-AUTH',
      label: 'User Authentication Session Drop',
      type: 'intermediate_service',
      severity: 'Medium',
      exposureUsd: 45000,
      status: 'Normal'
    },
    {
      id: 'BIZ-REVENUE',
      label: 'Checkout Cart Abandonment & SLA Breach',
      type: 'business_impact',
      severity: 'Critical',
      exposureUsd: 280000,
      status: 'Active Threat'
    }
  ];

  const links: CascadeLink[] = [
    { from: 'RSK-101', to: 'SVC-API', propagationLatency: '< 30 seconds' },
    { from: 'RSK-101', to: 'SVC-AUTH', propagationLatency: '< 2 minutes' },
    { from: 'SVC-API', to: 'BIZ-REVENUE', propagationLatency: '< 5 minutes' }
  ];

  const totalCumulativeLoss = nodes.reduce((acc, n) => acc + (n.status === 'Active Threat' ? n.exposureUsd : 0), 0);

  const handleSimulateMitigation = (id: string) => {
    addToast('Simulating Cascade Containment', `Applied circuit breaker containment to node ${id}.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Network className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Interactive Cascading Threat Propagation Graph
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visual network diagram mapping how upstream technical failures propagate into downstream business revenue impacts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            Cumulative Active Cascade Exposure: <strong className="text-red-700 font-mono">{formatCurrency(totalCumulativeLoss)}</strong>
          </span>
        </div>
      </div>

      {/* Visual Cascade Network Graph Container */}
      <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 shadow-2xl space-y-6 text-white relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Live Propagation Topology Map
          </span>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800 font-bold uppercase">
            Active Cascade Detected
          </span>
        </div>

        {/* Nodes Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Column 1: Upstream Trigger */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">1. Upstream Trigger Event</span>
            <div className="p-4 rounded-xl bg-slate-900 border border-red-500/50 space-y-2 shadow-lg ring-1 ring-red-500/30">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-800">
                  RSK-101
                </span>
                <span className="text-[10px] font-extrabold text-red-400 uppercase">Critical</span>
              </div>
              <h4 className="text-xs font-bold text-white">Database Connection Pool Lock</h4>
              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                <span>Loss Exposure:</span>
                <strong className="text-white font-mono">{formatCurrency(150000)}</strong>
              </div>
            </div>
          </div>

          {/* Column 2: Intermediate Services */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">2. Affected Subsystems</span>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded">
                    SVC-API
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">Latency &lt; 30s</span>
                </div>
                <h4 className="text-xs font-bold text-white">API Gateway Timeout & 504 Errors</h4>
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Impact:</span>
                  <strong className="text-amber-400 font-mono">{formatCurrency(85000)}</strong>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 space-y-1.5 opacity-60">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    SVC-AUTH
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">Latency &lt; 2m</span>
                </div>
                <h4 className="text-xs font-bold text-white">User Authentication Session Drop</h4>
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Status:</span>
                  <strong className="text-emerald-400">Contained</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Business Impact */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">3. Business Revenue Impact</span>
            <div className="p-4 rounded-xl bg-gradient-to-br from-red-950/60 to-slate-900 border border-red-600/60 space-y-2 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-red-300 bg-red-900/60 px-2 py-0.5 rounded">
                  BIZ-REVENUE
                </span>
                <span className="text-[10px] font-extrabold text-red-400 uppercase">SLA Breach</span>
              </div>
              <h4 className="text-xs font-bold text-white">Checkout Cart Abandonment & SLA Fine</h4>
              <div className="text-[10px] text-slate-300 flex items-center justify-between pt-1">
                <span>Final Exposure:</span>
                <strong className="text-red-400 font-mono text-sm">{formatCurrency(280000)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
