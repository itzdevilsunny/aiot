'use client';

import React from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { ShieldAlert, Printer, Sparkles, DollarSign, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function ReportPage() {
  const { risks, projects, workspaceSettings } = useRiskContext();

  const totalRisks = risks.length;
  const criticalRisks = risks.filter(r => r.severity === 'Critical');
  const highRisks = risks.filter(r => r.severity === 'High');
  const totalExposureUsd = risks.reduce((acc, r) => acc + (r.estimatedImpactUsd || r.score * 2500), 0);
  const avgProgress = totalRisks > 0 
    ? Math.round(risks.reduce((acc, r) => acc + r.mitigationProgress, 0) / totalRisks) 
    : 0;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 bg-white text-slate-900 font-sans print:p-0 print:max-w-none">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Executive Governance Report
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-800">
              Print / PDF Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            MNB Research • Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
          >
            Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="space-y-4">
        <div className="flex justify-between items-start border-b border-slate-900 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-950 uppercase tracking-tight">
              {workspaceSettings?.workspaceName || 'MNB Research Business Operations'}
            </h1>
            <p className="text-sm font-semibold text-slate-600 mt-1">
              Enterprise Risk Register & Monte Carlo Financial Exposure Briefing
            </p>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono">
            <div>CONFIDENTIAL</div>
            <div>Date: {new Date().toISOString().split('T')[0]}</div>
          </div>
        </div>

        {/* 4 Executive KPI Summary Boxes */}
        <div className="grid grid-cols-4 gap-4 pt-2">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
            <div className="text-xs font-bold text-slate-500 uppercase">Total Inventory</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalRisks} Items</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{projects.length} Active Workstreams</div>
          </div>

          <div className="p-3.5 rounded-lg border border-red-200 bg-red-50/50">
            <div className="text-xs font-bold text-red-700 uppercase">Critical Threats</div>
            <div className="text-2xl font-black text-red-900 mt-1">{criticalRisks.length} Items</div>
            <div className="text-[10px] text-red-600 mt-0.5">Score ≥ 17/25</div>
          </div>

          <div className="p-3.5 rounded-lg border border-indigo-200 bg-indigo-50/50">
            <div className="text-xs font-bold text-indigo-700 uppercase">Financial Exposure</div>
            <div className="text-2xl font-black text-indigo-950 mt-1 font-mono">
              ${totalExposureUsd.toLocaleString()}
            </div>
            <div className="text-[10px] text-indigo-600 mt-0.5">Estimated Portfolio Risk</div>
          </div>

          <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/50">
            <div className="text-xs font-bold text-emerald-700 uppercase">Readiness Rate</div>
            <div className="text-2xl font-black text-emerald-950 mt-1 font-mono">
              {avgProgress}%
            </div>
            <div className="text-[10px] text-emerald-600 mt-0.5">Avg Mitigation Completion</div>
          </div>
        </div>
      </div>

      {/* Top Threat Details Section */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">
          1. Critical & High Priority Risk Items
        </h2>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-900 text-slate-700 font-bold uppercase">
              <th className="py-2 pr-2">ID</th>
              <th className="py-2 px-2">Risk Title & Description</th>
              <th className="py-2 px-2">Cat</th>
              <th className="py-2 px-2 text-center">Score</th>
              <th className="py-2 px-2">Owner</th>
              <th className="py-2 pl-2 text-right">Exposure</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {[...criticalRisks, ...highRisks].map(r => (
              <tr key={r.id} className="align-top">
                <td className="py-2.5 pr-2 font-mono font-bold text-slate-900">{r.id}</td>
                <td className="py-2.5 px-2">
                  <div className="font-bold text-slate-900">{r.title}</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">{r.mitigationPlan}</div>
                </td>
                <td className="py-2.5 px-2 font-semibold text-slate-700">{r.category}</td>
                <td className="py-2.5 px-2 text-center">
                  <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${
                    r.severity === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {r.score}/25
                  </span>
                </td>
                <td className="py-2.5 px-2 text-slate-800 font-medium">
                  {r.ownerName}
                  <div className="text-[10px] text-slate-500">{r.ownerRole}</div>
                </td>
                <td className="py-2.5 pl-2 text-right font-mono font-bold text-slate-900">
                  ${(r.estimatedImpactUsd || r.score * 2500).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Governance & Sign-off Section */}
      <div className="pt-8 border-t border-slate-300 space-y-6">
        <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
          2. Operations Sign-off & Audit Acknowledgement
        </h2>

        <div className="grid grid-cols-2 gap-8 text-xs pt-4">
          <div className="border-t border-slate-400 pt-2 space-y-1">
            <div className="font-bold text-slate-900">Sunny Prasad</div>
            <div className="text-slate-500">Business Operations Intern & Lead Risk Assessor</div>
            <div className="text-[10px] text-slate-400">Signature: ___________________________</div>
          </div>

          <div className="border-t border-slate-400 pt-2 space-y-1">
            <div className="font-bold text-slate-900">Yash Raj</div>
            <div className="text-slate-500">Operations Lead & Executive Sponsor</div>
            <div className="text-[10px] text-slate-400">Signature: ___________________________</div>
          </div>
        </div>
      </div>
    </div>
  );
}
