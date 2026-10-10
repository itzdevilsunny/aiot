'use client';

import React from 'react';
import Link from 'next/link';
import { useRiskContext } from '../../context/RiskContext';
import { LIFECYCLE_STAGES, LifecycleStage } from '../../types/risk';
import { 
  ArrowRight,
  Workflow,
  Layers,
  ShieldCheck
} from 'lucide-react';

export const LifecyclePipelineCard: React.FC = () => {
  const { risks, controls, actions, evidence, kris, approvals } = useRiskContext();

  // Compute how many risks are in each stage
  const stageCounts: Record<LifecycleStage, number> = {
    Identify: 0,
    Assess: 0,
    Prioritise: 0,
    Treat: 0,
    Assign: 0,
    Monitor: 0,
    Review: 0,
    Approve: 0,
    Report: 0,
    Close: 0
  };

  risks.forEach(r => {
    const stage: LifecycleStage = r.lifecycleStage || (() => {
      if (r.status === 'Closed') return 'Close';
      if (r.aboveAppetite) return 'Approve';
      if (r.nextReviewDate && new Date(r.nextReviewDate) <= new Date()) return 'Review';
      if (r.mitigationProgress > 0) return 'Monitor';
      if (r.ownerName) return 'Assign';
      if (r.treatmentStrategy) return 'Treat';
      if (r.score >= 12) return 'Prioritise';
      if (r.inherentScore) return 'Assess';
      return 'Identify';
    })();
    stageCounts[stage] = (stageCounts[stage] || 0) + 1;
  });

  const getStageHref = (stage: LifecycleStage) => {
    switch (stage) {
      case 'Identify': return '/add';
      case 'Assess': return '/register';
      case 'Prioritise': return '/analytics';
      case 'Treat': return '/register';
      case 'Assign': return '/my-risks';
      case 'Monitor': return '/controls';
      case 'Review': return '/register';
      case 'Approve': return '/approvals';
      case 'Report': return '/report';
      case 'Close': return '/register';
      default: return '/register';
    }
  };

  const pendingApprovalsCount = approvals.filter(a => a.status === 'Pending').length;
  const verifiedEvidenceCount = evidence.filter(e => e.verificationStatus === 'Verified').length;
  const passedControlsCount = controls.filter(c => c.testStatus === 'Passed').length;
  const completedActionsCount = actions.filter(a => a.status === 'Completed').length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-4 space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            <Workflow className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <span>Risk Operating Lifecycle</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 font-mono-code">10-Stage Continuous Pipeline</span>
            </h2>
          </div>
        </div>

        <Link
          href="/register"
          className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 shrink-0"
        >
          <span>Lifecycle Register</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* 10-Stage Pipeline Horizontal Grid */}
      <div className="overflow-x-auto pb-0.5 no-scrollbar">
        <div className="min-w-[760px] grid grid-cols-10 gap-1.5">
          {LIFECYCLE_STAGES.map((s) => {
            const count = stageCounts[s.stage] || 0;
            const hasItems = count > 0;

            return (
              <Link
                key={s.stage}
                href={getStageHref(s.stage)}
                className={`p-2 rounded-lg border text-center transition-all hover:border-indigo-400 dark:hover:border-indigo-500 group ${
                  s.stage === 'Approve' && count > 0
                    ? 'bg-red-50/80 dark:bg-red-950/40 border-red-200 dark:border-red-900/60 ring-1 ring-red-400/40'
                    : hasItems
                      ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80 hover:bg-white dark:hover:bg-slate-800'
                      : 'bg-white dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 font-bold mb-0.5">
                  <span>#{s.step}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    s.stage === 'Approve' && count > 0 ? 'bg-red-500 animate-pulse' :
                    hasItems ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-slate-300 dark:bg-slate-700'
                  }`} />
                </div>

                <div className={`text-sm sm:text-base font-extrabold font-mono-code leading-tight ${
                  s.stage === 'Approve' && count > 0 ? 'text-red-700 dark:text-red-400' :
                  hasItems ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-600'
                }`}>
                  {count}
                </div>

                <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mt-0.5">
                  {s.label}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Core Operating Relationship Chain Bar */}
      <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 text-slate-800 dark:text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 min-w-0">
          <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400 font-medium truncate">
            Operating Chain: <strong className="text-slate-700 dark:text-slate-200 font-mono-code">Risk ({risks.length}) → Control ({controls.length}) → Evidence ({evidence.length}) → Action ({actions.length}) → Decision ({approvals.length})</strong>
          </span>
        </div>

        <div className="flex items-center gap-3 font-medium text-slate-600 dark:text-slate-300 shrink-0">
          <span>Controls: <strong className="text-emerald-600 dark:text-emerald-400 font-mono-code">{passedControlsCount}/{controls.length}</strong></span>
          <span>Actions: <strong className="text-indigo-600 dark:text-indigo-400 font-mono-code">{completedActionsCount}/{actions.length}</strong></span>
          <span>Approvals: <strong className="text-amber-600 dark:text-amber-400 font-mono-code">{pendingApprovalsCount}</strong></span>
        </div>
      </div>
    </div>
  );
};
