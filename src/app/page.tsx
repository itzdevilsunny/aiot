'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRiskContext } from '../context/RiskContext';
import { StatCard } from '../components/dashboard/StatCard';
import { RiskMatrix } from '../components/dashboard/RiskMatrix';
import { RiskDistribution } from '../components/dashboard/RiskDistribution';
import { RecentRisks } from '../components/dashboard/RecentRisks';
import { ExecutiveBriefingCard } from '../components/dashboard/ExecutiveBriefingCard';
import { Button } from '../components/ui/Button';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Sparkles
} from 'lucide-react';

export default function DashboardPage() {
  const { risks, getFilteredRisks, selectedProjectId, projects } = useRiskContext();

  const filteredRisks = getFilteredRisks();

  const totalRisks = filteredRisks.length;
  const criticalHighRisks = filteredRisks.filter(r => r.severity === 'Critical' || r.severity === 'High').length;
  const criticalCount = filteredRisks.filter(r => r.severity === 'Critical').length;
  const highCount = filteredRisks.filter(r => r.severity === 'High').length;
  const openRisks = filteredRisks.filter(r => r.status === 'Open').length;
  const avgProgress = totalRisks > 0 
    ? Math.round(filteredRisks.reduce((acc, r) => acc + r.mitigationProgress, 0) / totalRisks) 
    : 0;

  const activeProject = projects.find(p => p.id === selectedProjectId);
  const topCriticalRisk = filteredRisks.find(r => r.severity === 'Critical') || filteredRisks[0];

  const [aiTelemetryText, setAiTelemetryText] = useState<string>(
    'Copilot Telemetry: Multi-Region PostgreSQL locks detected. Elevating RSK-105 mitigation urgency recommended.'
  );

  // Fetch live Gemini AI Telemetry Insight
  useEffect(() => {
    async function fetchAiTelemetry() {
      try {
        const res = await fetch('/api/telemetry-insight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            criticalCount,
            highCount,
            topRiskTitle: topCriticalRisk?.title
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.insight) {
            setAiTelemetryText(data.insight);
          }
        }
      } catch (err) {
        // Keep default
      }
    }

    if (totalRisks > 0) {
      fetchAiTelemetry();
    }
  }, [totalRisks, criticalCount, highCount]);

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Good morning, Sunny
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {activeProject ? activeProject.name : 'MNB Research Operations'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            MNB Research · Monitor project risks, track mitigation actions, and stay ahead of operational challenges.
          </p>
        </div>

        {/* Primary & Secondary Action CTAs */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/add">
            <Button
              variant="copilot"
              size="sm"
              icon={<Sparkles className="w-3.5 h-3.5 text-indigo-200 animate-pulse" />}
            >
              AI Risk Analysis
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

      {/* Copilot Live Gemini AI Telemetry Insight Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-200/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-indigo-950 font-semibold leading-snug">
            {aiTelemetryText}
          </span>
        </div>
        {topCriticalRisk && (
          <Link href={`/risk/${topCriticalRisk.id}`} className="text-xs font-bold text-indigo-600 hover:underline shrink-0 hidden md:inline ml-3">
            View Top Threat →
          </Link>
        )}
      </div>

      {/* Executive Gemini Briefing Card */}
      <ExecutiveBriefingCard />

      {/* 4 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Risks"
          value={totalRisks}
          subValue="identified"
          trend={{ text: "+2 this week", type: "neutral" }}
          icon={<ShieldAlert className="w-4 h-4 text-indigo-600" />}
          iconBg="bg-indigo-50"
        />

        <StatCard
          label="Critical / High Risks"
          value={criticalHighRisks}
          subValue={`of ${totalRisks} total`}
          trend={{ text: criticalHighRisks > 3 ? 'High Attention Required' : 'Controlled', type: criticalHighRisks > 3 ? 'negative' : 'positive' }}
          icon={<AlertTriangle className="w-4 h-4 text-red-600" />}
          iconBg="bg-red-50"
        />

        <StatCard
          label="Open Risks"
          value={openRisks}
          subValue="in triage & active"
          trend={{ text: "3 in active mitigation", type: "neutral" }}
          icon={<Clock className="w-4 h-4 text-amber-600" />}
          iconBg="bg-amber-50"
        />

        <StatCard
          label="Mitigation Progress"
          value={`${avgProgress}%`}
          subValue="readiness rate"
          trend={{ text: "+8% sprint over sprint", type: "positive" }}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
      </div>

      {/* TWO-COLUMN SECTION: Risk Matrix & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskMatrix risks={filteredRisks} />
        <RiskDistribution risks={filteredRisks} />
      </div>

      {/* RECENT RISKS SECTION */}
      <RecentRisks risks={filteredRisks} />
    </div>
  );
}
