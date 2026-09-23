'use client';

import React from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { Users, Mail, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function TeamPage() {
  const { teamMembers, risks } = useRiskContext();

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/60">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-600" />
          <span>Team Directory & Risk Ownership</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Overview of cross-functional team leads, risk ownership capacity, and mitigation readiness.
        </p>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map(member => {
          const assignedList = risks.filter(r => r.ownerName === member.name);
          const openCount = assignedList.filter(r => r.status === 'Open').length;
          const criticalCount = assignedList.filter(r => r.severity === 'Critical' || r.severity === 'High').length;
          const avgProgress = assignedList.length > 0 
            ? Math.round(assignedList.reduce((acc, r) => acc + r.mitigationProgress, 0) / assignedList.length)
            : 100;

          return (
            <div key={member.id} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
                />
                <div className="truncate">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{member.name}</h3>
                  <p className="text-xs font-semibold text-indigo-600 truncate">{member.role}</p>
                  <p className="text-[10px] text-slate-400 truncate">{member.department}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned</span>
                  <div className="font-bold text-slate-900 mt-0.5">{assignedList.length}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Open</span>
                  <div className="font-bold text-indigo-600 mt-0.5">{openCount}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Crit/High</span>
                  <div className="font-bold text-red-600 mt-0.5">{criticalCount}</div>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                  <span>Mitigation Readiness</span>
                  <span>{avgProgress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-600" style={{ width: `${avgProgress}%` }} />
                </div>
              </div>

              {/* Email */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {member.email}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
