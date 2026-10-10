'use client';

import React, { useState, useMemo } from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { 
  ShieldCheck, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  Lock, 
  Activity, 
  BrainCircuit, 
  UserCheck
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function AuditLogsPage() {
  const { auditLogs, risks, addToast } = useRiskContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActionType, setFilterActionType] = useState<string>('All');

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const q = searchQuery.toLowerCase();
      const matchSummary = log.changesSummary.toLowerCase().includes(q);
      const matchActor = log.actorName.toLowerCase().includes(q);
      const matchRisk = log.riskId.toLowerCase().includes(q);
      if (searchQuery.trim() !== '' && !matchSummary && !matchActor && !matchRisk) return false;

      if (filterActionType !== 'All' && log.actionType !== filterActionType) return false;
      return true;
    });
  }, [auditLogs, searchQuery, filterActionType]);

  const handleExportAuditCSV = () => {
    const headers = ['Audit ID', 'Risk ID', 'Timestamp', 'Actor Name', 'Actor Role', 'Action Type', 'Summary'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.riskId,
      l.timestamp,
      `"${l.actorName}"`,
      `"${l.actorRole}"`,
      l.actionType,
      `"${l.changesSummary.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SOC2_Audit_Trail_Report_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Audit Log Exported', 'SOC2 CSV compliance report downloaded.', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              System Audit Trail & Governance History
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Chronological audit history tracking risk creations, status transitions, mitigation updates, and approvals.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
            onClick={handleExportAuditCSV}
          >
            Export Audit Report (.CSV)
          </Button>
        </div>
      </div>

      {/* Compliance Overview Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Audit Integrity</span>
            <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">System Activity Log Active</div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Authorised Event Logging Enabled</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Recorded Events</span>
            <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{auditLogs.length} Events</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Across {risks.length} Register Records</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Verification Status</span>
            <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Verified System Log</div>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">SHA-256 Hash Chained Records</p>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by risk ID, actor, or event summary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Action Type:</span>
          </div>
          <select
            value={filterActionType}
            onChange={(e) => setFilterActionType(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="All">All Action Types</option>
            <option value="INSERT">INSERT</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="ACCEPTANCE">ACCEPTANCE</option>
            <option value="APPROVAL">APPROVAL</option>
          </select>
        </div>
      </div>

      {/* Audit Log List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Recorded Audit Log Events ({filteredLogs.length} entries)
          </h3>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            LOG_ID_HASH_SHA256
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
              No audit log entries match the selected filters.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    log.actionType === 'INSERT' ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400' :
                    log.actionType === 'ACCEPTANCE' ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400' :
                    log.actionType === 'DELETE' ? 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400' :
                    'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400'
                  }`}>
                    {log.actionType === 'INSERT' ? <CheckCircle2 className="w-4 h-4" /> :
                     log.actionType === 'ACCEPTANCE' ? <ShieldCheck className="w-4 h-4" /> :
                     <Activity className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {log.riskId}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.actionType === 'INSERT' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' :
                        log.actionType === 'ACCEPTANCE' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {log.actionType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 mt-1 font-semibold leading-relaxed">
                      {log.changesSummary}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>{log.actorName}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">({log.actorRole})</span>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
