'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useRiskContext } from '../../context/RiskContext';
import { RiskFilters } from '../../components/risks/RiskFilters';
import { RiskTable } from '../../components/risks/RiskTable';
import { RiskDependencyGraph } from '../../components/risks/RiskDependencyGraph';
import { Button } from '../../components/ui/Button';
import { Plus, Sparkles, ShieldAlert, Download, Upload, Network, Table } from 'lucide-react';
import { exportRisksToCSV, parseCSVToRisks } from '../../lib/exportUtils';

export default function RiskRegisterPage() {
  const { getFilteredRisks, risks, addRisk, addToast } = useRiskContext();
  const filteredRisks = getFilteredRisks();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [viewMode, setViewMode] = useState<'table' | 'graph'>('table');

  const criticalCount = risks.filter(r => r.severity === 'Critical').length;
  const highCount = risks.filter(r => r.severity === 'High').length;
  const mitigatedCount = risks.filter(r => r.status === 'Mitigated').length;

  const handleExportCSV = () => {
    exportRisksToCSV(filteredRisks, `risk_register_${Date.now()}.csv`);
    addToast('CSV Export Triggered', `Exported ${filteredRisks.length} risk records to CSV file.`, 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const imported = parseCSVToRisks(text);
        if (imported.length === 0) {
          addToast('Import Warning', 'No valid risk records found in uploaded file.', 'warning');
          return;
        }

        imported.forEach(r => {
          addRisk({
            title: r.title || 'Imported Risk',
            description: r.description || '',
            category: r.category || 'Operational',
            probability: r.probability || 3,
            impact: r.impact || 3,
            status: r.status || 'Open',
            projectId: 'proj-1',
            projectName: r.projectName || 'Project Alpha',
            ownerId: 'u-1',
            ownerName: r.ownerName || 'Sunny Prasad',
            ownerRole: r.ownerRole || 'Business Operations Intern',
            mitigationPlan: r.mitigationPlan || 'Mitigation strategy pending.',
            contingencyPlan: r.contingencyPlan || 'Fallback plan pending.',
            mitigationProgress: r.mitigationProgress || 0,
            checklist: [],
            activityLogs: [{
              id: `act-${Date.now()}`,
              timestamp: 'Just now',
              author: 'CSV Bulk Importer',
              action: 'Bulk imported risk record via CSV file upload.',
              type: 'creation'
            }]
          });
        });

        addToast('Bulk Import Successful', `Successfully imported ${imported.length} new risk records into register.`, 'success');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 pb-12">
      {/* Hidden File Input for CSV Import */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <span>Risk Register</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              Live Sync Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Centralized repository of all identified project operational, technical, and resource risks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold mr-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors ${
                viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors ${
                viewMode === 'graph' ? 'bg-white dark:bg-slate-900 text-indigo-900 dark:text-indigo-300 shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Network className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Cascading Threat Graph</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<Upload className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
            onClick={() => fileInputRef.current?.click()}
          >
            Import CSV
          </Button>

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

      {/* Quick Summary Pill Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Registered</span>
          <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{risks.length} Items</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Critical / High Severity</span>
          <span className="text-sm font-extrabold text-red-600 dark:text-red-400">{criticalCount + highCount} Items</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Mitigated & Closed</span>
          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{mitigatedCount} Items</span>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'table' ? (
        <>
          <RiskFilters />
          <RiskTable risks={filteredRisks} />
        </>
      ) : (
        <RiskDependencyGraph />
      )}
    </div>
  );
}
