'use client';

import React, { useMemo } from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { Users, Mail, ShieldAlert, CheckCircle2, Activity, UserCheck, AlertTriangle } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function TeamPage() {
  const { teamMembers, risks } = useRiskContext();

  // Compute workload capacity & density metrics per team member
  const workloadMetrics = useMemo(() => {
    return teamMembers.map(member => {
      const assignedList = risks.filter(r => r.ownerName === member.name);
      const openCount = assignedList.filter(r => r.status === 'Open').length;
      const criticalCount = assignedList.filter(r => r.severity === 'Critical' || r.severity === 'High').length;
      const avgProgress = assignedList.length > 0 
        ? Math.round(assignedList.reduce((acc, r) => acc + r.mitigationProgress, 0) / assignedList.length)
        : 100;

      // Workload Load % (Max capacity set to 8 open risks)
      const maxCap = 8;
      const loadPct = Math.min(100, Math.round((assignedList.length / maxCap) * 100));

      let capacityStatus = 'Optimal';
      let capacityColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
      if (loadPct >= 85) {
        capacityStatus = 'Overloaded';
        capacityColor = 'text-red-700 bg-red-50 border-red-200';
      } else if (loadPct >= 60) {
        capacityStatus = 'High Load';
        capacityColor = 'text-amber-700 bg-amber-50 border-amber-200';
      }

      return {
        id: member.id,
        name: member.name,
        role: member.role,
        email: member.email,
        department: member.department,
        avatar: member.avatar,
        totalAssigned: assignedList.length,
        openCount,
        criticalCount,
        avgProgress,
        loadPct,
        capacityStatus,
        capacityColor,
        assignedList
      };
    });
  }, [teamMembers, risks]);

  return (
    <div className="space-y-6 animate-in fade-in-50 pb-12">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/60">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-600" />
          <span>Team Workload Capacity & Ownership Directory</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Overview of cross-functional team leads, risk ownership capacity distribution, and mitigation readiness.
        </p>
      </div>

      {/* Team Workload Capacity Density Visualizer */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>Owner Workload & Critical Threat Density Distribution</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Real-time capacity tracking across team members to prevent operational bottlenecks.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              Assigned Items
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              Critical/High Threats
            </span>
          </div>
        </div>

        <div className="h-[220px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={workloadMetrics} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderRadius: '8px', 
                  color: '#fff', 
                  fontSize: '11px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }} 
              />
              <Bar dataKey="totalAssigned" fill="#6366f1" radius={[4, 4, 0, 0]} name="Assigned Risks" />
              <Bar dataKey="criticalCount" fill="#ef4444" radius={[4, 4, 0, 0]} name="Critical/High Risks" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workloadMetrics.map(member => (
          <div key={member.id} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-4">
            <div className="flex items-center justify-between">
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

              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${member.capacityColor}`}>
                {member.capacityStatus}
              </span>
            </div>

            {/* Workload Load Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>Capacity Load</span>
                <span className="font-mono text-slate-900">{member.loadPct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    member.loadPct >= 85 ? 'bg-red-600' :
                    member.loadPct >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${member.loadPct}%` }}
                />
              </div>
            </div>

            {/* Key Metrics Pill Grid */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned</span>
                <div className="font-bold text-slate-900 mt-0.5">{member.totalAssigned}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Open</span>
                <div className="font-bold text-indigo-600 mt-0.5">{member.openCount}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Crit/High</span>
                <div className="font-bold text-red-600 mt-0.5">{member.criticalCount}</div>
              </div>
            </div>

            {/* Mitigation Progress */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                <span>Mitigation Readiness</span>
                <span>{member.avgProgress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-600" style={{ width: `${member.avgProgress}%` }} />
              </div>
            </div>

            {/* Email */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{member.email}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
