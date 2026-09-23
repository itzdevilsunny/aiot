'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRiskContext } from '../../context/RiskContext';

export const OwnerChart: React.FC = () => {
  const { teamMembers, risks } = useRiskContext();

  const data = teamMembers.map(member => ({
    name: member.name,
    assigned: risks.filter(r => r.ownerName === member.name).length,
    critical: risks.filter(r => r.ownerName === member.name && (r.severity === 'Critical' || r.severity === 'High')).length
  }));

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Workload by Owner</h3>
          <p className="text-xs text-slate-500">Total assigned risks vs critical/high priority items per team member.</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748B' }} width={90} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
            />
            <Bar dataKey="assigned" name="Assigned Risks" fill="#3B82F6" radius={[0, 4, 4, 0]} />
            <Bar dataKey="critical" name="Critical/High Risks" fill="#EF4444" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
