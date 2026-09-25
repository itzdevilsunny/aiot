'use client';

import React, { useState, useEffect } from 'react';
import { RiskItem } from '../../types/risk';
import { useRiskContext } from '../../context/RiskContext';
import { Button } from '../ui/Button';
import { 
  ShieldAlert, 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Crosshair, 
  Eye, 
  ShieldCheck, 
  RotateCcw,
  Zap
} from 'lucide-react';

interface AIRedTeamerModalProps {
  isOpen: boolean;
  onClose: () => void;
  risk: RiskItem | null;
}

export const AIRedTeamerModal: React.FC<AIRedTeamerModalProps> = ({ isOpen, onClose, risk }) => {
  const { updateRisk, addToast } = useRiskContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [redTeamData, setRedTeamData] = useState<any>(null);

  useEffect(() => {
    if (isOpen && risk) {
      runRedTeamAudit();
    }
  }, [isOpen, risk]);

  if (!isOpen || !risk) return null;

  const runRedTeamAudit = async () => {
    setIsLoading(true);
    setRedTeamData(null);
    addToast('AI Red-Teamer Engaged', `Stress-testing threat assumptions for ${risk.id}...`, 'info');

    try {
      const res = await fetch('/api/red-team-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ risk })
      });

      if (!res.ok) throw new Error('Failed to run AI Red Team audit');
      const data = await res.json();
      setRedTeamData(data);
      addToast('Red-Team Audit Complete', 'Synthesized 3-tier defense strategy and blind spot analysis.', 'success');
    } catch (err: any) {
      console.error(err);
      // Fallback
      setRedTeamData({
        blindSpots: [
          'Underestimating database connection pool starvation under peak load.',
          'Assumes third-party API provider guarantees 99.99% uptime without contractual penalty.',
          'Lacks automated verification for backup restoration scripts.'
        ],
        challengedLikelihood: Math.min(5, risk.probability + 1),
        challengedImpact: Math.min(5, risk.impact + 1),
        challengedScore: Math.min(25, (risk.probability + 1) * (risk.impact + 1)),
        strategies: {
          preventative: [
            'Enforce mandatory connection pool circuit breakers.',
            'Deploy secondary failover provider with instant DNS routing.',
            'Establish 24/7 on-call DevOps rotation with automated page alerts.'
          ],
          detective: [
            'Implement 5-second synthetic health check monitors.',
            'Stream error log spikes to real-time Slack incident channel.',
            'Enable continuous IAM permission auditing.'
          ],
          corrective: [
            'Automate snapshot rollback script execution within 2 minutes.',
            'Activate read-only database replica fallback.',
            'Issue post-mortem RCA report within 24 hours.'
          ]
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyRedTeamPlaybook = () => {
    if (!redTeamData) return;

    const newChecklistItems = [
      ...(redTeamData.strategies?.preventative || []).map((p: string, i: number) => ({
        id: `chk-red-prev-${Date.now()}-${i}`,
        title: `[Preventative] ${p}`,
        completed: false
      })),
      ...(redTeamData.strategies?.detective || []).map((d: string, i: number) => ({
        id: `chk-red-det-${Date.now()}-${i}`,
        title: `[Detective] ${d}`,
        completed: false
      })),
      ...(redTeamData.strategies?.corrective || []).map((c: string, i: number) => ({
        id: `chk-red-corr-${Date.now()}-${i}`,
        title: `[Corrective] ${c}`,
        completed: false
      }))
    ];

    updateRisk(risk.id, {
      probability: redTeamData.challengedLikelihood || risk.probability,
      impact: redTeamData.challengedImpact || risk.impact,
      checklist: [...risk.checklist, ...newChecklistItems],
      mitigationPlan: `[AI Red-Team Hardened] ${redTeamData.strategies?.preventative?.[0] || risk.mitigationPlan}`
    });

    addToast('Red-Team Playbook Applied', `Updated risk score and appended 9 defense tasks to ${risk.id}.`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Crosshair className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight">
                  Adversarial AI Security Red-Teamer
                </h2>
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-red-950 text-red-300 border border-red-800">
                  Stress Test Active
                </span>
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
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Groq AI Red-Teamer Stress-Testing Threat Scope...</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Formulating adversarial attack vectors, challenging risk rating assumptions, and synthesizing 3-tier defense controls.
              </p>
            </div>
          ) : redTeamData ? (
            <div className="space-y-6">
              {/* Rating Challenge Box */}
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Red-Team Rating Challenge
                  </span>
                  <div className="text-xs text-red-900 mt-1 font-medium">
                    Current Rating: <strong className="font-mono">{risk.score}</strong> ({risk.severity}) → Challenged Rating: <strong className="font-mono text-red-700">{redTeamData.challengedScore} / 25</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono font-bold">
                  <span className="px-2.5 py-1 rounded bg-white text-slate-800 border border-red-200">
                    Prob: {redTeamData.challengedLikelihood}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-white text-slate-800 border border-red-200">
                    Impact: {redTeamData.challengedImpact}
                  </span>
                </div>
              </div>

              {/* Vulnerabilities & Blindspots */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-red-600" />
                  Identified Threat Vulnerabilities & Assumptions
                </h4>
                <div className="space-y-1.5">
                  {(redTeamData.blindSpots || []).map((bs: string, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium flex items-start gap-2">
                      <span className="text-red-500 font-bold">•</span>
                      <span>{bs}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3-Tier Strategy Tabs Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Synthesized 3-Tier Defense Strategy
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Preventative */}
                  <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-2">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">1. Preventative</span>
                    <ul className="space-y-1.5 text-[11px] text-slate-700 font-medium">
                      {(redTeamData.strategies?.preventative || []).map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Detective */}
                  <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2">
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">2. Detective</span>
                    <ul className="space-y-1.5 text-[11px] text-slate-700 font-medium">
                      {(redTeamData.strategies?.detective || []).map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Corrective */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">3. Corrective</span>
                    <ul className="space-y-1.5 text-[11px] text-slate-700 font-medium">
                      {(redTeamData.strategies?.corrective || []).map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>

          {redTeamData && (
            <Button
              variant="copilot"
              size="sm"
              icon={<Zap className="w-3.5 h-3.5 text-indigo-200" />}
              onClick={handleApplyRedTeamPlaybook}
            >
              Apply 3-Tier Playbook to Risk Register
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
