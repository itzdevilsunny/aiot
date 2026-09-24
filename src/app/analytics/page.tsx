'use client';

import React from 'react';
import Link from 'next/link';
import { useRiskContext } from '../../context/RiskContext';
import { TrendChart } from '../../components/analytics/TrendChart';
import { CategoryChart } from '../../components/analytics/CategoryChart';
import { OwnerChart } from '../../components/analytics/OwnerChart';
import { FinancialExposureChart } from '../../components/analytics/FinancialExposureChart';
import { RiskDistribution } from '../../components/dashboard/RiskDistribution';
import { BarChart3, SlidersHorizontal, Sparkles, ArrowRight } from 'lucide-react';

export default function AnalyticsPage() {
  const { risks } = useRiskContext();

  return (
    <div className="space-y-6 animate-in fade-in-50 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            <span>Operational Risk Intelligence & Analytics</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Quantitative telemetry insights into risk discovery velocity, owner workload distribution, and category severity.
          </p>
        </div>

        <Link
          href="/simulation"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-extrabold text-white bg-slate-900 rounded-xl hover:bg-slate-800 shadow-xs transition-colors shrink-0"
        >
          <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
          <span>Launch Monte Carlo Simulation</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </div>

      {/* Financial Exposure Variance Hero Section */}
      <FinancialExposureChart />

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
