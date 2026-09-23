'use client';

import React from 'react';
import Link from 'next/link';
import { useRiskContext } from '../../context/RiskContext';
import { RiskFilters } from '../../components/risks/RiskFilters';
import { RiskTable } from '../../components/risks/RiskTable';
import { Button } from '../../components/ui/Button';
import { Plus, Sparkles, ShieldAlert } from 'lucide-react';

export default function RiskRegisterPage() {
  const { getFilteredRisks, risks } = useRiskContext();
  const filteredRisks = getFilteredRisks();

  const criticalCount = risks.filter(r => r.severity === 'Critical').length;
  const highCount = risks.filter(r => r.severity === 'High').length;
  const mitigatedCount = risks.filter(r => r.status === 'Mitigated').length;

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-indigo-600" />
              <span>Risk Register</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Live Sync Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Centralized repository of all identified project operational, technical, and resource risks.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/add">
            <Button
              variant="copilot"
              size="sm"
              icon={<Sparkles className="w-3.5 h-3.5 text-indigo-200" />}
            >
              AI Analyze
            </Button>
          </Link>

          <Link href="/add">
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
            >
              Add Risk
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Summary Pill Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Total Registered</span>
          <span className="text-sm font-extrabold text-slate-900">{risks.length} Items</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Critical / High Severity</span>
          <span className="text-sm font-extrabold text-red-600">{criticalCount + highCount} Items</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Mitigated & Closed</span>
          <span className="text-sm font-extrabold text-emerald-600">{mitigatedCount} Items</span>
        </div>
      </div>

      {/* Filters Bar */}
      <RiskFilters />

      {/* Main Data Table */}
      <RiskTable risks={filteredRisks} />
    </div>
  );
}
