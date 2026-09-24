'use client';

import React, { useState } from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { RiskItem } from '../../types/risk';
import { Network, ArrowRight, ShieldAlert, Sparkles, Layers, Info } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const RiskDependencyGraph: React.FC = () => {
  const { risks } = useRiskContext();
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(risks[0]?.id || null);

  const selectedRisk = risks.find(r => r.id === selectedRiskId) || risks[0];

  // Synthesize cascading downstream impacts based on category & severity
  const cascadingChain = React.useMemo(() => {
    if (!selectedRisk) return [];

    const chain: Array<{
      step: number;
      label: string;
      riskId?: string;
      category: string;
      severity: string;
      description: string;
    }> = [];

    // Step 1: Root Trigger Event
    chain.push({
      step: 1,
      label: 'Root Cause Incident',
      riskId: selectedRisk.id,
      category: selectedRisk.category,
      severity: selectedRisk.severity,
      description: selectedRisk.title
    });

    // Step 2: Operational Impact
    if (selectedRisk.category === 'Technical' || selectedRisk.category === 'Security') {
      chain.push({
        step: 2,
        label: 'Downstream System Degradation',
        category: 'Operational',
        severity: selectedRisk.severity === 'Critical' ? 'Critical' : 'High',
        description: 'API endpoint latency spike (>800ms) & transaction rollback locks'
      });
    } else if (selectedRisk.category === 'Resource') {
      chain.push({
        step: 2,
        label: 'Delivery Window Squeeze',
        category: 'Schedule',
        severity: 'High',
        description: 'Sprint capacity reduced by 40%, delaying QA staging sign-off'
      });
    } else {
      chain.push({
        step: 2,
        label: 'SLA Boundary Breach',
        category: 'Compliance',
        severity: 'Medium',
        description: 'Third-party vendor response timeout & contract SLA penalty'
      });
    }

    // Step 3: Financial & Executive Exposure
    chain.push({
      step: 3,
      label: 'Enterprise Financial Loss',
      category: 'Financial',
      severity: selectedRisk.severity,
      description: `Estimated financial exposure impact of $${(selectedRisk.estimatedImpactUsd || selectedRisk.score * 2500).toLocaleString()} USD`
    });

    return chain;
  }, [selectedRisk]);

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Network className="w-4.5 h-4.5 text-indigo-600" />
            <span>Interactive Risk Dependency & Cascading Threat Graph</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Select a root operational risk to trace its downstream technical, schedule, and financial chain reaction.
          </p>
        </div>

        <span className="text-[10px] px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold uppercase tracking-wider self-start sm:self-auto">
          Cascading Threat Engine
        </span>
      </div>

      {/* Main Grid: Left Risk Selector / Right Graph Node Chain */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Risk Item Selector List */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Select Root Risk ({risks.length} registered)
          </span>

          <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
            {risks.map(r => {
              const isSelected = r.id === selectedRiskId;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRiskId(r.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-900 text-white border-indigo-900 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {r.id}
                    </span>
                    <Badge severity={r.severity} />
                  </div>
                  <h4 className="font-bold mt-1.5 truncate">{r.title}</h4>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Cascading Node Pathway Visualizer */}
        {selectedRisk && (
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Active Threat Trace</span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  Score: {selectedRisk.score} / 25 ({selectedRisk.severity})
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-100">{selectedRisk.title}</h3>
              <p className="text-[11px] text-slate-400">
                Project: <strong>{selectedRisk.projectName}</strong> · Owner: <strong>{selectedRisk.ownerName}</strong>
              </p>
            </div>

            {/* Step-by-Step Cascading Connectors */}
            <div className="space-y-3 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-indigo-200">
              {cascadingChain.map((item) => (
                <div key={item.step} className="relative pl-12">
                  {/* Circle Node Number */}
                  <div className="absolute left-3 top-1 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center ring-4 ring-white shadow-xs">
                    {item.step}
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">
                        {item.label}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 font-bold text-slate-700">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
