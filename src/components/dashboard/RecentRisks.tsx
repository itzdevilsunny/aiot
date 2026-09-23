'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RiskItem } from '../../types/risk';
import { Badge } from '../ui/Badge';
import { ArrowUpRight, ShieldAlert, ArrowRight } from 'lucide-react';

interface RecentRisksProps {
  risks: RiskItem[];
}

export const RecentRisks: React.FC<RecentRisksProps> = ({ risks }) => {
  const router = useRouter();
  const recentList = risks.slice(0, 6);

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-600" />
            <span>Active Risk Items</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Highest score and recent operational risk threats requiring attention.</p>
        </div>

        <Link
          href="/register"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
        >
          <span>View All Register ({risks.length})</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="space-y-3">
        {recentList.map(risk => (
          <div
            key={risk.id}
            onClick={() => router.push(`/risk/${risk.id}`)}
            className="p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:shadow-subtle transition-all bg-white hover:bg-slate-50/50 cursor-pointer group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-start gap-3 min-w-0">
                <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shrink-0">
                  {risk.id}
                </span>

                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate flex items-center gap-2">
                    <span>{risk.title}</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                    <Badge variant="category">{risk.category}</Badge>
                    <span>•</span>
                    <span>Project: {risk.projectName}</span>
                  </div>
                </div>
              </div>

              {/* Badges & Owner */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <div className="flex items-center gap-2">
                  <div className="text-right hidden md:block">
                    <div className="text-[11px] font-semibold text-slate-800">{risk.ownerName}</div>
                    <div className="text-[10px] text-slate-500">{risk.ownerRole}</div>
                  </div>
                  {risk.ownerAvatar ? (
                    <img src={risk.ownerAvatar} alt={risk.ownerName} className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center">
                      {risk.ownerName.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                  <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded bg-slate-900 text-white">
                    {risk.score}
                  </span>
                  <Badge severity={risk.severity} />
                  <Badge status={risk.status} />
                </div>
              </div>
            </div>

            {/* Mitigation Excerpt */}
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <div className="text-slate-600 truncate max-w-xl">
                <span className="font-semibold text-slate-700">Mitigation: </span>
                {risk.mitigationPlan}
              </div>
              <span className="text-[10px] text-slate-400 shrink-0 font-medium ml-2">{risk.lastUpdated}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
