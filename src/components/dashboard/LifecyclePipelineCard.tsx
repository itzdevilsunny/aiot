'use client';

import React from 'react';
import Link from 'next/link';
import { useRiskContext } from '../../context/RiskContext';
import { LIFECYCLE_STAGES, LifecycleStage } from '../../types/risk';
import { 
  Sparkles, 
  ChevronRight, 
  ShieldAlert, 
  ShieldCheck, 
  FileCheck, 
  CheckSquare, 
  Gauge, 
  Clock, 
  FileText,
  ArrowRight,
  Workflow
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Workflow className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Enterprise Risk Operating Lifecycle (10-Stage Continuous Pipeline)
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-indigo-50 text-indigo-700 tracking-wide border border-indigo-200">
              Operating Model
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Moving beyond a static risk database: Operating <strong className="text-slate-700">Identify → Assess → Prioritise → Treat → Assign → Monitor → Review → Approve → Report → Close</strong> with automated governance enforcement.
          </p>
        </div>

        <Link
          href="/register"
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 shrink-0"
        >
          <span>View Lifecycle Register</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 10-Stage Pipeline Horizontal Scroller */}
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
                    ? 'bg-red-50/70 border-red-200 ring-2 ring-red-100'
                    : hasItems
                      ? 'bg-slate-50/80 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30'
                      : 'bg-white border-slate-100 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1">
                  <span>#{s.step}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    s.stage === 'Approve' && count > 0 ? 'bg-red-500 animate-pulse' :
                    hasItems ? 'bg-indigo-600' : 'bg-slate-300'
                  }`} />
                </div>

                <div className={`text-lg font-black font-mono ${
                  s.stage === 'Approve' && count > 0 ? 'text-red-700' :
                  hasItems ? 'text-slate-900' : 'text-slate-400'
                }`}>
                  {count}
                </div>

                <div className="text-[11px] font-bold text-slate-800 truncate group-hover:text-indigo-600">
                  {s.label}
                </div>

                <div className="text-[9px] text-slate-400 font-medium truncate mt-0.5">
                  {s.category}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Core Operating Relationship Chain Bar */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <span className="font-extrabold tracking-tight">Structured Operating Layer: </span>
            <span className="text-slate-300 font-medium font-mono text-[11px]">
              Risk ({risks.length}) → Control ({controls.length}) → Evidence ({evidence.length}) → Action ({actions.length}) → KRI ({kris.length}) → Review ({risks.length}) → Decision ({approvals.length})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-300 shrink-0">
          <span>Controls Tested: <strong className="text-emerald-400 font-mono">{passedControlsCount}/{controls.length}</strong></span>
          <span>Actions Done: <strong className="text-indigo-300 font-mono">{completedActionsCount}/{actions.length}</strong></span>
          <span>Approvals Queue: <strong className="text-amber-400 font-mono">{pendingApprovalsCount}</strong></span>
        </div>
      </div>
    </div>
  );
};
