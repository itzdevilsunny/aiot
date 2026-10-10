'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRiskContext } from '../context/RiskContext';
import { StatCard } from '../components/dashboard/StatCard';
import { RiskMatrix } from '../components/dashboard/RiskMatrix';
import { RiskDistribution } from '../components/dashboard/RiskDistribution';
import { RecentRisks } from '../components/dashboard/RecentRisks';
import { ExecutiveBriefingCard } from '../components/dashboard/ExecutiveBriefingCard';
import { LifecyclePipelineCard } from '../components/dashboard/LifecyclePipelineCard';
import { WhatIfSimulator } from '../components/dashboard/WhatIfSimulator';
import { Button } from '../components/ui/Button';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Sparkles,
  FileText,
  CheckSquare,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function DashboardPage() {
  const { 
    risks, 
    actions, 
    evidence, 
    approvals, 
    kris,
    getFilteredRisks, 
    selectedProjectId, 
    projects,
    currentUser,
    workspaceSettings 
  } = useRiskContext();

  const filteredRisks = getFilteredRisks();

  const totalRisks = filteredRisks.length;
  const criticalHighRisks = filteredRisks.filter(r => r.severity === 'Critical' || r.severity === 'High').length;
  const criticalCount = filteredRisks.filter(r => r.severity === 'Critical').length;
  const highCount = filteredRisks.filter(r => r.severity === 'High').length;
  
  // Real database-calculated stats
  const aboveAppetiteRisks = filteredRisks.filter(r => r.aboveAppetite || ((r.residualScore ?? r.score) > workspaceSettings.riskAppetiteThreshold));
  const now = new Date();
  const overdueActionsCount = actions.filter(a => a.status !== 'Completed' && new Date(a.dueDate) < now).length;
  const expiringEvidenceCount = evidence.filter(e => e.validityExpiryDate && new Date(e.validityExpiryDate) < now).length;
  const pendingApprovalsCount = approvals.filter(a => a.status === 'Pending').length;

  const avgProgress = totalRisks > 0 
    ? Math.round(filteredRisks.reduce((acc, r) => acc + r.mitigationProgress, 0) / totalRisks) 
    : 0;

  const activeProject = projects.find(p => p.id === selectedProjectId);
  const topCriticalRisk = filteredRisks.find(r => r.severity === 'Critical') || filteredRisks[0];

  const [aiTelemetryText, setAiTelemetryText] = useState<string>(
    'Copilot Telemetry: Multi-Region PostgreSQL locks detected. Elevating RSK-105 mitigation urgency recommended.'
  );

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
      } catch (err) {}
    }

    if (totalRisks > 0) {
      fetchAiTelemetry();
    }
  }, [totalRisks, criticalCount, highCount]);

  return (
    <div className="space-y-6 animate-in fade-in-50 pb-12">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Welcome back, {currentUser.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              {activeProject ? activeProject.name : 'MNB Research Operations'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            MNB Research Enterprise Risk Operating System · Connecting Risks to Controls, Evidence, Actions, & Decisions.
          </p>
        </div>

        {/* Primary Action CTA */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/add">
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
            >
              Create Risk
            </Button>
          </Link>
        </div>
      </div>

      {/* Risk Appetite Breach Alert Banner */}
      {aboveAppetiteRisks.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-500/10 dark:bg-red-950/40 border border-red-300 dark:border-red-900/60 flex items-center justify-between gap-4 text-xs animate-in zoom-in-95">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-600 text-white shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="font-extrabold text-red-950 dark:text-red-100 text-sm">
                Risk Appetite Threshold Exceeded ({aboveAppetiteRisks.length} Risk{aboveAppetiteRisks.length > 1 ? 's' : ''})
              </div>
              <div className="text-red-700 dark:text-red-300 text-xs font-medium mt-0.5">
                Residual exposure for {aboveAppetiteRisks.map(r => r.id).join(', ')} exceeds configured threshold ({workspaceSettings.riskAppetiteThreshold}). Governance approval required.
              </div>
            </div>
          </div>
          <Link
            href="/approvals"
            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shrink-0 flex items-center gap-1.5 transition-colors"
          >
            <span>Review & Approve</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Priority Operational Telemetry Insight Banner */}
      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <span className="text-slate-800 dark:text-slate-200 font-medium leading-snug">
            {aiTelemetryText}
          </span>
        </div>
        {topCriticalRisk && (
          <Link href={`/risk/${topCriticalRisk.id}`} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 hidden md:inline ml-3">
            View Top Threat →
          </Link>
        )}
      </div>

      {/* Executive Briefing Card */}
      <ExecutiveBriefingCard />

      {/* 10-STAGE CONTINUOUS OPERATING LIFECYCLE PIPELINE */}
      <LifecyclePipelineCard />

      {/* 6 OPERATIONAL KPI CARDS (Clickable to Filtered Views) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <StatCard
          label="Total Risks"
          value={totalRisks}
          subValue="in register"
          trend={{ text: "Active", type: "neutral" }}
          icon={<ShieldAlert className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
          iconBg="bg-indigo-50 dark:bg-indigo-950/60"
          href="/register"
        />

        <StatCard
          label="Critical / High"
          value={criticalHighRisks}
          subValue="high exposure"
          trend={{ text: criticalHighRisks > 3 ? 'Action Needed' : 'Controlled', type: criticalHighRisks > 3 ? 'negative' : 'positive' }}
          icon={<AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />}
          iconBg="bg-red-50 dark:bg-red-950/60"
          href="/register?severity=Critical"
        />

        <StatCard
          label="Above Appetite"
          value={aboveAppetiteRisks.length}
          subValue="requires approval"
          trend={{ text: aboveAppetiteRisks.length > 0 ? 'Breach' : 'Within Limit', type: aboveAppetiteRisks.length > 0 ? 'negative' : 'positive' }}
          icon={<ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
          iconBg="bg-amber-50 dark:bg-amber-950/60"
          href="/approvals"
        />

        <StatCard
          label="Overdue Actions"
          value={overdueActionsCount}
          subValue="mitigation SLA"
          trend={{ text: overdueActionsCount > 0 ? 'Overdue' : 'On Track', type: overdueActionsCount > 0 ? 'negative' : 'positive' }}
          icon={<CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
          iconBg="bg-purple-50 dark:bg-purple-950/60"
          href="/actions"
        />

        <StatCard
          label="Expiring Evidence"
          value={expiringEvidenceCount}
          subValue="compliance files"
          trend={{ text: expiringEvidenceCount > 0 ? 'Expired' : 'Valid', type: expiringEvidenceCount > 0 ? 'negative' : 'positive' }}
          icon={<FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
          iconBg="bg-blue-50 dark:bg-blue-950/60"
          href="/evidence"
        />

        <StatCard
          label="Pending Approvals"
          value={pendingApprovalsCount}
          subValue="governance queue"
          trend={{ text: pendingApprovalsCount > 0 ? 'Pending' : 'Cleared', type: pendingApprovalsCount > 0 ? 'neutral' : 'positive' }}
          icon={<Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
          iconBg="bg-emerald-50 dark:bg-emerald-950/60"
          href="/approvals"
        />
      </div>

      {/* TWO-COLUMN SECTION: Risk Matrix & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskMatrix risks={filteredRisks} />
        <RiskDistribution risks={filteredRisks} />
      </div>

      {/* WHAT-IF MITIGATION IMPACT SIMULATOR */}
      <WhatIfSimulator />

      {/* RECENT RISKS SECTION */}
      <RecentRisks risks={filteredRisks} />
    </div>
  );
}
