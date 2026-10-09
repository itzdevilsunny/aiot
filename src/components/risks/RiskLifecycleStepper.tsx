'use client';

import React from 'react';
import { 
  RiskItem, 
  LifecycleStage, 
  LIFECYCLE_STAGES, 
  Control, 
  MitigationAction, 
  EvidenceRecord, 
  KeyRiskIndicator, 
  ApprovalRequest 
} from '../../types/risk';
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  ChevronRight, 
  ShieldAlert, 
  ShieldCheck, 
  FileCheck, 
  CheckSquare, 
  Gauge, 
  Clock, 
  Sparkles,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../ui/Button';

interface RiskLifecycleStepperProps {
  risk: RiskItem;
  linkedControls?: Control[];
  linkedActions?: MitigationAction[];
  linkedEvidence?: EvidenceRecord[];
  linkedKris?: KeyRiskIndicator[];
  linkedApproval?: ApprovalRequest;
  onUpdateStage?: (stage: LifecycleStage) => void;
}

export const RiskLifecycleStepper: React.FC<RiskLifecycleStepperProps> = ({
  risk,
  linkedControls = [],
  linkedActions = [],
  linkedEvidence = [],
  linkedKris = [],
  linkedApproval,
  onUpdateStage
}) => {
  // Infer current stage if not explicitly set
  const currentStage: LifecycleStage = risk.lifecycleStage || (() => {
    if (risk.status === 'Closed') return 'Close';
    if (linkedApproval && linkedApproval.status === 'Pending') return 'Approve';
    if (risk.aboveAppetite && !linkedApproval) return 'Approve';
    if (risk.nextReviewDate && new Date(risk.nextReviewDate) <= new Date()) return 'Review';
    if (linkedActions.length > 0 || linkedControls.length > 0) return 'Monitor';
    if (risk.ownerName) return 'Assign';
    if (risk.treatmentStrategy) return 'Treat';
    if (risk.score) return 'Prioritise';
    if (risk.inherentScore) return 'Assess';
    return 'Identify';
  })();

  const currentStepIndex = LIFECYCLE_STAGES.findIndex(s => s.stage === currentStage);
  const currentStep = LIFECYCLE_STAGES[currentStepIndex] || LIFECYCLE_STAGES[0];

  const handleNextStage = () => {
    if (currentStepIndex < LIFECYCLE_STAGES.length - 1 && onUpdateStage) {
      onUpdateStage(LIFECYCLE_STAGES[currentStepIndex + 1].stage);
    }
  };

  const handlePrevStage = () => {
    if (currentStepIndex > 0 && onUpdateStage) {
      onUpdateStage(LIFECYCLE_STAGES[currentStepIndex - 1].stage);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-5 space-y-5">
      {/* Top Header & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 tracking-wider">
              Operating Lifecycle
            </span>
            <span className="text-xs text-slate-400 font-semibold">•</span>
            <span className="text-xs font-bold text-slate-700">
              Stage {currentStep.step} of 10: <strong className="text-indigo-600">{currentStep.label}</strong>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {currentStep.description}
          </p>
        </div>

        {onUpdateStage && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrevStage}
              disabled={currentStepIndex === 0}
              className="px-2.5 py-1 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
            >
              ← Prev Stage
            </button>
            <button
              onClick={handleNextStage}
              disabled={currentStepIndex === LIFECYCLE_STAGES.length - 1}
              className="px-3 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Advance Stage</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 10-Step Interactive Horizontal Stepper */}
      <div className="relative overflow-x-auto pb-2">
        <div className="min-w-[760px] flex items-center justify-between relative">
          {/* Connector Line */}
          <div className="absolute left-4 right-4 top-4 -translate-y-1/2 h-1 bg-slate-100 rounded-full -z-0" />
          <div 
            className="absolute left-4 top-4 -translate-y-1/2 h-1 bg-indigo-600 rounded-full transition-all duration-300 -z-0" 
            style={{ width: `${(currentStepIndex / (LIFECYCLE_STAGES.length - 1)) * 95}%` }}
          />

          {LIFECYCLE_STAGES.map((s, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <button
                key={s.stage}
                onClick={() => onUpdateStage && onUpdateStage(s.stage)}
                disabled={!onUpdateStage}
                className={`flex flex-col items-center gap-1.5 z-10 transition-transform group cursor-pointer ${
                  !onUpdateStage ? 'cursor-default' : ''
                }`}
                title={`${s.step}. ${s.label}: ${s.description}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                  isCompleted 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : isCurrent
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-md scale-110'
                      : 'bg-white border-2 border-slate-200 text-slate-400 group-hover:border-slate-300'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span>{s.step}</span>
                  )}
                </div>

                <div className="text-center">
                  <span className={`block text-[11px] font-bold transition-colors ${
                    isCurrent ? 'text-indigo-900 font-extrabold' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                  }`}>
                    {s.label}
                  </span>
                  <span className="block text-[9px] text-slate-400 font-medium">
                    {s.category}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* CORE OPERATIONAL RELATIONSHIP STRIP: Risk → Control → Evidence → Action → KRI → Review → Decision */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Core Enterprise Operating Relationship Chain
          </span>
          <span className="text-[10px] font-semibold text-slate-400">
            Risk Management Operating Layer
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1 text-xs">
          {/* 1. Risk */}
          <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-red-500" /> Risk
            </span>
            <div className="font-extrabold text-slate-900 mt-1 truncate">{risk.id}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Score: <strong className="font-mono text-slate-800">{risk.inherentScore || risk.score}</strong> → <strong className="font-mono text-indigo-600">{risk.residualScore || risk.score}</strong>
            </div>
          </div>

          {/* 2. Control */}
          <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-indigo-500" /> Control
            </span>
            <div className="font-extrabold text-slate-900 mt-1">
              {linkedControls.length} Active
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 truncate">
              {linkedControls.filter(c => c.testStatus === 'Passed').length} Tested Pass
            </div>
          </div>

          {/* 3. Evidence */}
          <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <FileCheck className="w-3 h-3 text-blue-500" /> Evidence
            </span>
            <div className="font-extrabold text-slate-900 mt-1">
              {linkedEvidence.length} Artifacts
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 truncate">
              {linkedEvidence.filter(e => e.verificationStatus === 'Verified').length} Verified
            </div>
          </div>

          {/* 4. Action */}
          <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <CheckSquare className="w-3 h-3 text-emerald-500" /> Action
            </span>
            <div className="font-extrabold text-slate-900 mt-1">
              {linkedActions.length} Assigned
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 truncate">
              {linkedActions.filter(a => a.status === 'Completed').length} Done
            </div>
          </div>

          {/* 5. KRI */}
          <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Gauge className="w-3 h-3 text-purple-500" /> KRI
            </span>
            <div className="font-extrabold text-slate-900 mt-1">
              {linkedKris.length > 0 ? `${linkedKris.length} Monitored` : 'Active Metrics'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 truncate">
              Telemetry Active
            </div>
          </div>

          {/* 6. Review */}
          <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" /> Review
            </span>
            <div className="font-extrabold text-slate-900 mt-1 truncate">
              {risk.reviewFrequency || 'Monthly'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 truncate">
              Next: {risk.nextReviewDate || '2026-10-31'}
            </div>
          </div>

          {/* 7. Decision */}
          <div className={`p-2 rounded-lg border shadow-2xs ${
            linkedApproval?.status === 'Approved' ? 'bg-emerald-50/70 border-emerald-200' :
            linkedApproval?.status === 'Pending' ? 'bg-amber-50/70 border-amber-200' :
            risk.aboveAppetite ? 'bg-red-50/70 border-red-200' : 'bg-white border-slate-200'
          }`}>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3 h-3 text-indigo-500" /> Decision
            </span>
            <div className="font-extrabold text-slate-900 mt-1 truncate">
              {linkedApproval ? `Approval ${linkedApproval.status}` : risk.aboveAppetite ? 'Sign-off Needed' : 'Within Appetite'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 truncate">
              {risk.treatmentStrategy || 'Mitigate'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
