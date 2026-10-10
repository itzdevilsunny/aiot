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
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-card p-5 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Workflow className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Enterprise Risk Operating Lifecycle (10-Stage Continuous Pipeline)
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 tracking-wide border border-indigo-200 dark:border-indigo-800">
              Operating Model
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Continuous Governance Pipeline: <strong className="text-slate-700 dark:text-slate-300">Identify → Assess → Prioritise → Treat → Assign → Monitor → Review → Approve → Report → Close</strong> with automated SLA tracking.
          </p>
        </div>

        <Link
          href="/register"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 shrink-0"
        >
          <span>View Lifecycle Register</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 10-Stage Pipeline Horizontal Grid */}
      <div className="overflow-x-auto pb-1">
        <div className="min-w-[840px] grid grid-cols-10 gap-2">
          {LIFECYCLE_STAGES.map((s) => {
            const count = stageCounts[s.stage] || 0;
            const hasItems = count > 0;

            return (
              <Link
                key={s.stage}
                href={getStageHref(s.stage)}
                className={`p-2.5 rounded-xl border text-center transition-all hover:scale-[1.02] group ${
                  s.stage === 'Approve' && count > 0
                    ? 'bg-red-50/70 dark:bg-red-950/40 border-red-200 dark:border-red-900/60 ring-2 ring-red-100 dark:ring-red-900/30'
                    : hasItems
                      ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-slate-800/80'
                      : 'bg-white dark:bg-slate-900/60 border-slate-100 dark:border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-bold mb-1">
                  <span>#{s.step}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    s.stage === 'Approve' && count > 0 ? 'bg-red-500 animate-pulse' :
                    hasItems ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-slate-300 dark:bg-slate-700'
                  }`} />
                </div>

                <div className={`text-lg font-black font-mono-code ${
                  s.stage === 'Approve' && count > 0 ? 'text-red-700 dark:text-red-400' :
                  hasItems ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-600'
                }`}>
                  {count}
                </div>

                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {s.label}
                </div>

                <div className="text-[9px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
                  {s.category}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Core Operating Relationship Chain Bar */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <div>
            <span className="font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Enterprise Operating Chain: </span>
            <span className="text-slate-600 dark:text-slate-400 font-medium font-mono-code text-[11px]">
              Risk ({risks.length}) → Control ({controls.length}) → Evidence ({evidence.length}) → Action ({actions.length}) → KRI ({kris.length}) → Review ({risks.length}) → Decision ({approvals.length})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-600 dark:text-slate-300 shrink-0">
          <span>Controls Tested: <strong className="text-emerald-600 dark:text-emerald-400 font-mono-code">{passedControlsCount}/{controls.length}</strong></span>
          <span>Actions Done: <strong className="text-indigo-600 dark:text-indigo-400 font-mono-code">{completedActionsCount}/{actions.length}</strong></span>
          <span>Approvals Queue: <strong className="text-amber-600 dark:text-amber-400 font-mono-code">{pendingApprovalsCount}</strong></span>
        </div>
      </div>
    </div>
  );
};
