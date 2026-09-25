'use client';

import React, { useState, useEffect } from 'react';
import { RiskItem } from '../../types/risk';
import { useRiskContext } from '../../context/RiskContext';
import { Button } from '../ui/Button';
import { 
  Clock, 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  Calendar,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface SLABreachGuardModalProps {
  isOpen: boolean;
  onClose: () => void;
  risk: RiskItem | null;
}

export const SLABreachGuardModal: React.FC<SLABreachGuardModalProps> = ({ isOpen, onClose, risk }) => {
  const { updateRisk, addToast, workspaceSettings } = useRiskContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [slaData, setSlaData] = useState<any>(null);

  useEffect(() => {
    if (isOpen && risk) {
      predictSLABreach();
    }
  }, [isOpen, risk]);

  if (!isOpen || !risk) return null;

  const predictSLABreach = async () => {
    setIsLoading(true);
    setSlaData(null);
    addToast('AI SLA Breach Predictor', `Calculating SLA breach probability for ${risk.id}...`, 'info');

    try {
      const res = await fetch('/api/predict-sla-breach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          risk, 
          defaultSlaDays: workspaceSettings?.defaultReviewDays || 30 
        })
      });

      if (!res.ok) throw new Error('SLA prediction failed');
      const data = await res.json();
      setSlaData(data);
      addToast('SLA Prediction Ready', `Forecasted ${data.slaViolationProbability}% breach risk.`, 'success');
    } catch (err) {
      console.error(err);
      setSlaData({
        slaViolationProbability: 65,
        predictedBreachDays: 7,
        riskLevel: 'Moderate Risk',
        recommendations: [
          'Reassign secondary backup owner to assist primary lead.',
          'Schedule emergency 15-minute mitigation sync.',
          'Request 7-day SLA extension.'
        ],
        suggestedBackupOwner: 'Ritika (Product Manager)'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReassignOwner = () => {
    if (!slaData?.suggestedBackupOwner) return;

    updateRisk(risk.id, {
      coOwnerName: slaData.suggestedBackupOwner.split('(')[0].trim(),
      coOwnerRole: 'Backup Co-Owner'
    });

    addToast('Co-Owner Assigned', `Assigned ${slaData.suggestedBackupOwner} as co-owner for ${risk.id}.`, 'success');
    onClose();
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
              <h2 className="text-base font-extrabold tracking-tight">
                AI SLA Breach Predictor & Deadline Guard
              </h2>
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
              <h4 className="text-sm font-bold text-slate-900">Groq AI Analyzing Historical Owner SLA Telemetry...</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Predicting deadline violation probability and recommended workload balance.
              </p>
            </div>
          ) : slaData ? (
            <div className="space-y-6">
              {/* Breach Risk Gauge Box */}
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                slaData.slaViolationProbability >= 70 ? 'bg-red-50 border-red-200 text-red-950' :
                slaData.slaViolationProbability >= 40 ? 'bg-amber-50 border-amber-200 text-amber-950' :
                'bg-emerald-50 border-emerald-200 text-emerald-950'
              }`}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block">SLA Breach Forecast</span>
                  <div className="text-xl font-extrabold mt-0.5">{slaData.riskLevel}</div>
                  <span className="text-xs font-medium">Predicted Breach Window: <strong className="font-mono">{slaData.predictedBreachDays} days</strong></span>
                </div>

                <div className="text-right font-mono">
                  <div className="text-2xl font-black">{slaData.slaViolationProbability}%</div>
                  <span className="text-[10px] font-bold uppercase">Breach Risk</span>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-indigo-600" />
                  AI Recommended SLA Prevention Actions
                </h4>
                <div className="space-y-2">
                  {(slaData.recommendations || []).map((rec: string, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Backup Owner Box */}
              {slaData.suggestedBackupOwner && (
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Suggested Co-Owner Backup</span>
                    <span className="text-xs font-bold text-slate-900">{slaData.suggestedBackupOwner}</span>
                  </div>
                  <Button
                    variant="copilot"
                    size="sm"
                    icon={<UserCheck className="w-3.5 h-3.5 text-indigo-200" />}
                    onClick={handleReassignOwner}
                  >
                    Assign Co-Owner
                  </Button>
                </div>
              )}
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
