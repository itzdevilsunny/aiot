'use client';

import React, { useState, useEffect } from 'react';
import { RiskItem } from '../../types/risk';
import { useRiskContext } from '../../context/RiskContext';
import { Button } from '../ui/Button';
import { 
  Zap, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  X, 
  TrendingUp, 
  Activity,
  Layers,
  ShieldAlert
} from 'lucide-react';

interface RiskVelocityModalProps {
  isOpen: boolean;
  onClose: () => void;
  risk: RiskItem | null;
}

export const RiskVelocityModal: React.FC<RiskVelocityModalProps> = ({ isOpen, onClose, risk }) => {
  const { addToast } = useRiskContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [velocityData, setVelocityData] = useState<any>(null);

  useEffect(() => {
    if (isOpen && risk) {
      runVelocityAnalysis();
    }
  }, [isOpen, risk]);

  if (!isOpen || !risk) return null;

  const runVelocityAnalysis = async () => {
    setIsLoading(true);
    setVelocityData(null);
    addToast('AI Risk Velocity Analyzer', `Simulating cascade velocity and time-to-impact for ${risk.id}...`, 'info');

    try {
      const res = await fetch('/api/analyze-risk-velocity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ risk })
      });

      if (!res.ok) throw new Error('Velocity calculation failed');
      const data = await res.json();
      setVelocityData(data);
      addToast('Velocity Simulation Complete', `Evaluated ${data.velocityCategory} impact window.`, 'success');
    } catch (err) {
      console.error(err);
      // Fallback
      setVelocityData({
        velocityCategory: 'Rapid',
        timeToImpactHours: 6,
        estimatedMitigationHours: 12,
        slaBufferHours: -6,
        slaStatus: 'CRITICAL SLA DEFICIT',
        cascadePathways: [
          'Primary service API response latency exceeds 2.5s',
          'Database read connection pool locks up',
          'End-user checkout transactions fail silently'
        ],
        recommendedUrgency: 'Immediate On-Call Escalation'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight">
                  AI Risk Velocity & Time-to-Impact SLA Simulator
                </h2>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Target: <strong className="text-white font-mono">{risk.id}</strong> — {risk.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {isLoading ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Calculating Cascade Velocity Horizon...</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Evaluating propagation speed, time-to-impact, and mitigation SLA buffer index.
              </p>
            </div>
          ) : velocityData ? (
            <div className="space-y-6">
              {/* Velocity Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                velocityData.slaStatus === 'CRITICAL SLA DEFICIT' ? 'bg-red-50 border-red-200 text-red-950' :
                velocityData.slaStatus === 'WARNING' ? 'bg-amber-50 border-amber-200 text-amber-950' :
                'bg-emerald-50 border-emerald-200 text-emerald-950'
              }`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Velocity Category: <strong>{velocityData.velocityCategory}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-white border shadow-2xs">
                      {velocityData.slaStatus}
                    </span>
                  </div>
                  <p className="text-xs mt-1 font-medium">
                    Recommended Action: <strong>{velocityData.recommendedUrgency}</strong>
                  </p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Time to Impact</span>
                  <div className="text-xl font-black text-slate-900 font-mono mt-1">
                    {velocityData.timeToImpactHours}h
                  </div>
                  <span className="text-[10px] text-slate-500">Propagation window</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Mitigation Time</span>
                  <div className="text-xl font-black text-indigo-950 font-mono mt-1">
                    {velocityData.estimatedMitigationHours}h
                  </div>
                  <span className="text-[10px] text-slate-500">Execution time</span>
                </div>

                <div className="border-l border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">SLA Buffer Index</span>
                  <div className={`text-xl font-black font-mono mt-1 ${
                    velocityData.slaBufferHours < 0 ? 'text-red-600' : 'text-emerald-600'
                  }`}>
                    {velocityData.slaBufferHours > 0 ? `+${velocityData.slaBufferHours}h` : `${velocityData.slaBufferHours}h`}
                  </div>
                  <span className="text-[10px] text-slate-500">Safety margin</span>
                </div>
              </div>

              {/* Cascade Pathway */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Cascading Risk Propagation Pathway
                </h4>
                <div className="space-y-2 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-200">
                  {(velocityData.cascadePathways || []).map((step: string, idx: number) => (
                    <div key={idx} className="relative pl-7 text-xs bg-white p-2.5 rounded-xl border border-slate-200">
                      <div className="absolute left-1.5 top-3.5 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-white" />
                      <span className="font-bold text-indigo-950">Step {idx + 1}: </span>
                      <span className="text-slate-700 font-medium">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
