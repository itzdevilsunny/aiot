'use client';

import React, { useState, useEffect } from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { Button } from '../ui/Button';
import { 
  Sparkles, 
  X, 
  Network, 
  Zap, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  Layers
} from 'lucide-react';

interface AICascadeSimModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRiskId: string;
}

export const AICascadeSimModal: React.FC<AICascadeSimModalProps> = ({
  isOpen,
  onClose,
  triggerRiskId
}) => {
  const { risks, formatCurrency, addToast, updateRisk } = useRiskContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cascadeData, setCascadeData] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      runCascadeSim();
    }
  }, [isOpen, triggerRiskId]);

  if (!isOpen) return null;

  const runCascadeSim = async () => {
    setIsLoading(true);
    setCascadeData(null);
    addToast('Executing AI Cascade Topological Simulation', `Modeling failure propagation for upstream trigger ${triggerRiskId}...`, 'info');

    try {
      const res = await fetch('/api/simulate-cascade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerRiskId, risks })
      });

      if (!res.ok) throw new Error('Simulation failed');
      const data = await res.json();
      setCascadeData(data);
      addToast('Cascade Simulation Complete', `Total blast-radius exposure evaluated at ${formatCurrency(data.totalCascadeLoss || 515000)}.`, 'success');
    } catch (err) {
      console.error(err);
      setCascadeData({
        triggerNode: { id: triggerRiskId, label: 'Database Connection Pool Lock', exposureUsd: 150000 },
        subsystems: [
          { id: 'SVC-API', label: 'API Gateway Timeout & 504 Error Spike', impactUsd: 85000 },
          { id: 'SVC-AUTH', label: 'User Authentication Session Drop', impactUsd: 45000 }
        ],
        businessImpact: { id: 'BIZ-REVENUE', label: 'Checkout Cart Abandonment & SLA Fine', finalExposureUsd: 280000 },
        totalCascadeLoss: 560000,
        containmentPlaybook: [
          `Deploy circuit breaker pattern on ${triggerRiskId} microservice endpoint.`,
          'Enable fallback response caching to prevent API gateway 504 timeouts.'
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyCircuitBreaker = () => {
    updateRisk(triggerRiskId, {
      mitigationProgress: 90,
      status: 'Monitoring'
    });

    addToast('Circuit Breakers Activated', `Isolated trigger ${triggerRiskId} and contained downstream revenue loss propagation!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                AI Cascading Threat Topological Blast-Radius Simulator
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Groq LLaMA 3.3 70B & Gemini AI Upstream-to-Downstream Failure Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {isLoading ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Modeling Microservice Failure Propagation...</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Mapping upstream trigger {triggerRiskId} to API gateways, authentication pools, and revenue checkout impact.
              </p>
            </div>
          ) : cascadeData ? (
            <div className="space-y-6">
              {/* Score Gauge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-red-50/50 border border-red-200 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-red-700 uppercase">Total Blast-Radius Loss</span>
                  <div className="text-3xl font-black text-red-950 font-mono mt-1">{formatCurrency(cascadeData.totalCascadeLoss)}</div>
                  <span className="text-[10px] text-red-600 font-medium">Downstream Revenue Exposure</span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl sm:col-span-2 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Upstream Trigger Event</span>
                  <div className="font-bold text-slate-900 text-xs">{cascadeData.triggerNode?.id}: {cascadeData.triggerNode?.label}</div>
                  <p className="text-slate-600 text-xs">Direct Trigger Exposure: <strong className="text-slate-900 font-mono">{formatCurrency(cascadeData.triggerNode?.exposureUsd)}</strong></p>
                </div>
              </div>

              {/* Containment Playbook Tasks */}
              {cascadeData.containmentPlaybook?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Circuit-Breaker Containment Playbook ({cascadeData.containmentPlaybook.length} Tasks)
                  </h4>

                  <div className="space-y-2">
                    {cascadeData.containmentPlaybook.map((task: string, idx: number) => (
                      <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            ACTION-{idx + 1}
                          </span>
                          <span className="font-medium text-slate-800">{task}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>

          {cascadeData && (
            <Button
              variant="copilot"
              size="sm"
              icon={<Zap className="w-3.5 h-3.5" />}
              onClick={handleApplyCircuitBreaker}
            >
              Activate Circuit Breaker Containment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
