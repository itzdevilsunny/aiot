'use client';

import React, { useState, useMemo } from 'react';
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
  CheckCircle2,
  Download,
  Activity
} from 'lucide-react';
import { AICascadeSimModal } from '../cascade/AICascadeSimModal';

export const CascadePropagationGraph: React.FC = () => {
  const { risks, formatCurrency, updateRisk, addToast } = useRiskContext();

  const [selectedTriggerId, setSelectedTriggerId] = useState<string>(risks[0]?.id || 'RSK-101');
  const [isAICascadeModalOpen, setIsAICascadeModalOpen] = useState<boolean>(false);
  const [isCircuitBreakerActive, setIsCircuitBreakerActive] = useState<boolean>(false);

  const activeRisks = useMemo(() => risks.filter(r => r.status !== 'Closed'), [risks]);
  const triggerRisk = useMemo(() => {
    return activeRisks.find(r => r.id === selectedTriggerId) || activeRisks[0] || {
      id: 'RSK-101',
      title: 'Database Connection Pool Lock',
      score: 16,
      category: 'Technical',
      estimatedImpactUsd: 150000
    };
  }, [activeRisks, selectedTriggerId]);

  const triggerLoss = triggerRisk.estimatedImpactUsd || (triggerRisk.score * 25000);
  const apiGatewayLoss = Math.round(triggerLoss * 0.55);
  const authSessionLoss = Math.round(triggerLoss * 0.30);
  const businessRevenueLoss = Math.round(triggerLoss * 1.85);

  const cumulativeActiveExposure = isCircuitBreakerActive 
    ? triggerLoss 
    : (triggerLoss + apiGatewayLoss + businessRevenueLoss);

  const handleToggleCircuitBreaker = () => {
    const nextState = !isCircuitBreakerActive;
    setIsCircuitBreakerActive(nextState);

    if (nextState) {
      updateRisk(triggerRisk.id, {
        mitigationProgress: 90,
        status: 'Monitoring'
      });
      addToast('Circuit Breakers Activated', `Isolated upstream trigger ${triggerRisk.id} and contained revenue loss.`, 'success');
    } else {
      addToast('Circuit Breakers Reset', `Restored normal topology propagation monitoring.`, 'info');
    }
  };

  const handleExportTopologyText = () => {
    const lines = [
      `=================================================================`,
      `ENTERPRISE CASCADING THREAT TOPOLOGY AUDIT REPORT`,
      `Generated: ${new Date().toISOString().split('T')[0]} | MNB Research Operations`,
      `=================================================================\n`,
      `UPSTREAM TRIGGER RISK: [${triggerRisk.id}] ${triggerRisk.title}`,
      `Trigger Direct Exposure: ${formatCurrency(triggerLoss)}`,
      `Circuit Breaker Containment: ${isCircuitBreakerActive ? 'ACTIVE (Contained)' : 'DISABLED (Propagating)'}`,
      `Cumulative Cascade Exposure: ${formatCurrency(cumulativeActiveExposure)}\n`,
      `TOPOLOGY FAILURE PROPAGATION PATHWAYS:`,
      `-----------------------------------------------------------------`,
      `1. UPSTREAM TRIGGER: [${triggerRisk.id}] ${triggerRisk.title} (${formatCurrency(triggerLoss)})`,
      `2. AFFECTED SUBSYSTEM 1: API Gateway Timeout & 504 Errors (${formatCurrency(apiGatewayLoss)} | Latency < 30s)`,
      `3. AFFECTED SUBSYSTEM 2: User Authentication Session Drop (${formatCurrency(authSessionLoss)} | Contained)`,
      `4. BUSINESS REVENUE IMPACT: Checkout Cart Abandonment & SLA Fine (${formatCurrency(businessRevenueLoss)} | ${isCircuitBreakerActive ? 'MITIGATED' : 'CRITICAL BREACH'})`,
      `-----------------------------------------------------------------`
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cascading_Threat_Topology_Report_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Topology Report Exported', 'Downloaded Cascading Threat Propagation report.', 'success');
  };

  return (
    <>
      <AICascadeSimModal
        isOpen={isAICascadeModalOpen}
        onClose={() => setIsAICascadeModalOpen(false)}
        triggerRiskId={triggerRisk.id}
      />

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

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="copilot"
              size="sm"
              icon={<Sparkles className="w-3.5 h-3.5 text-indigo-200" />}
              onClick={() => setIsAICascadeModalOpen(true)}
            >
              Run AI Cascade Simulation
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-3.5 h-3.5 text-indigo-600" />}
              onClick={handleExportTopologyText}
            >
              Export Topology (.TXT)
            </Button>

            {/* Trigger Selector Dropdown */}
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-slate-600 pl-1">Upstream Trigger:</span>
              <select
                value={selectedTriggerId}
                onChange={(e) => setSelectedTriggerId(e.target.value)}
                className="text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-hidden"
              >
                {activeRisks.map(r => (
                  <option key={r.id} value={r.id}>{r.id} - {r.title.slice(0, 20)}...</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Overview Stat Box */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cumulative Cascade Loss Exposure</span>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {formatCurrency(cumulativeActiveExposure)}
              </div>
            </div>
          </div>

          <Button
            variant={isCircuitBreakerActive ? 'primary' : 'copilot'}
            size="sm"
            icon={<Zap className="w-3.5 h-3.5 text-amber-300" />}
            onClick={handleToggleCircuitBreaker}
          >
            {isCircuitBreakerActive ? 'Circuit Breakers ACTIVE (Containment On)' : 'Activate Circuit Breakers'}
          </Button>
        </div>

        {/* Visual Cascade Network Graph Container */}
        <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 shadow-2xl space-y-6 text-white relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Live Propagation Topology Map
            </span>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
              isCircuitBreakerActive 
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                : 'bg-red-950 text-red-400 border border-red-800'
            }`}>
              {isCircuitBreakerActive ? 'Circuit Breaker Active' : 'Active Cascade Detected'}
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
                    {triggerRisk.id}
                  </span>
                  <span className="text-[10px] font-extrabold text-red-400 uppercase">{triggerRisk.severity || 'Critical'}</span>
                </div>
                <h4 className="text-xs font-bold text-white">{triggerRisk.title}</h4>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Loss Exposure:</span>
                  <strong className="text-white font-mono">{formatCurrency(triggerLoss)}</strong>
                </div>
              </div>
            </div>

            {/* Column 2: Affected Subsystems */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">2. Affected Subsystems</span>
              <div className="space-y-3">
                <div className={`p-3.5 rounded-xl bg-slate-900 border space-y-1.5 transition-all ${
                  isCircuitBreakerActive ? 'border-emerald-500/50' : 'border-amber-500/50'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded">
                      SVC-API
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">Latency &lt; 30s</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">API Gateway Timeout & 504 Error Spike</h4>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Impact:</span>
                    <strong className={isCircuitBreakerActive ? 'text-emerald-400 font-mono' : 'text-amber-400 font-mono'}>
                      {isCircuitBreakerActive ? 'Contained ($0)' : formatCurrency(apiGatewayLoss)}
                    </strong>
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
              <div className={`p-4 rounded-xl bg-slate-900 border space-y-2 transition-all ${
                isCircuitBreakerActive ? 'border-emerald-500/50' : 'border-red-600/60 bg-gradient-to-br from-red-950/60 to-slate-900'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-red-300 bg-red-900/60 px-2 py-0.5 rounded">
                    BIZ-REVENUE
                  </span>
                  <span className={`text-[10px] font-extrabold uppercase ${
                    isCircuitBreakerActive ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {isCircuitBreakerActive ? 'Mitigated' : 'SLA Breach'}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white">Checkout Cart Abandonment & SLA Fine</h4>
                <div className="text-[10px] text-slate-300 flex items-center justify-between pt-1">
                  <span>Final Exposure:</span>
                  <strong className={`font-mono text-sm ${
                    isCircuitBreakerActive ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {isCircuitBreakerActive ? '$0 (Contained)' : formatCurrency(businessRevenueLoss)}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
