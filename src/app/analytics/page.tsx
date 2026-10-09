'use client';

import React from 'react';
import Link from 'next/link';
import { useRiskContext } from '../../context/RiskContext';
import { TrendChart } from '../../components/analytics/TrendChart';
import { CategoryChart } from '../../components/analytics/CategoryChart';
import { OwnerChart } from '../../components/analytics/OwnerChart';
import { FinancialExposureChart } from '../../components/analytics/FinancialExposureChart';
import { PredictiveRiskRadar } from '../../components/analytics/PredictiveRiskRadar';
import { RiskDistribution } from '../../components/dashboard/RiskDistribution';
import { BarChart3, Printer, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AnalyticsPage() {
  const { risks } = useRiskContext();

  return (
    <div className="space-y-6 animate-in fade-in-50 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            <span>Operational Risk Intelligence & Predictive Analytics</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Quantitative telemetry insights into risk discovery velocity, category concentration, and 12-month loss trajectories.
          </p>
        </div>

        <Link
          href="/report"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-extrabold text-white bg-slate-900 rounded-xl hover:bg-slate-800 shadow-xs transition-colors shrink-0"
        >
          <Printer className="w-4 h-4 text-emerald-400" />
          <span>Executive Governance Report</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </div>

      {/* Financial Exposure Variance Hero Section */}
      <FinancialExposureChart />

      {/* 12-Month Predictive Loss Trajectory & Velocity Radar */}
      <div className="pt-2">
        <PredictiveRiskRadar />
      </div>

      {/* Top 2 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart />
        <RiskDistribution risks={risks} />
      </div>

      {/* Bottom 2 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart />
        <OwnerChart />
      </div>
    </div>
  );
}
