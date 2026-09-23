'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRiskContext } from '../../context/RiskContext';
import { Badge } from '../../components/ui/Badge';
import { UserCheck, Clock, AlertCircle, ArrowUpRight } from 'lucide-react';

export default function MyRisksPage() {
  const router = useRouter();
  const { risks } = useRiskContext();

  const myRisks = risks.filter(r => r.ownerName === 'Sunny P.' || r.coOwnerName === 'Sunny P.');
  const criticalCount = myRisks.filter(r => r.severity === 'Critical' || r.severity === 'High').length;

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/60">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-indigo-600" />
          <span>My Assigned Risks & Actions</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Filtered workspace view displaying risks and mitigation checklist items owned by Sunny P.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">My Assigned Risks</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{myRisks.length}</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">High Priority / Critical</span>
          <div className="text-xl font-bold text-red-600 mt-1">{criticalCount} Items</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Readiness Average</span>
          <div className="text-xl font-bold text-emerald-600 mt-1">
            {myRisks.length > 0 ? Math.round(myRisks.reduce((a, b) => a + b.mitigationProgress, 0) / myRisks.length) : 100}%
          </div>
        </div>
      </div>

      {/* Risks Stream */}
      <div className="space-y-3">
        {myRisks.map(risk => (
          <div
            key={risk.id}
            onClick={() => router.push(`/risk/${risk.id}`)}
            className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-subtle transition-all cursor-pointer group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                  {risk.id}
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                    <span>{risk.title}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{risk.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded bg-slate-900 text-white">
                  Score {risk.score}
                </span>
                <Badge severity={risk.severity} />
                <Badge status={risk.status} />
              </div>
            </div>

            {/* Due date & checklist */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Target Resolution: <strong>{risk.dueDate || 'Nov 30, 2024'}</strong></span>
              </div>
              <span className="font-semibold text-indigo-600">
                {risk.checklist.filter(c => c.completed).length}/{risk.checklist.length} checklist items complete
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
