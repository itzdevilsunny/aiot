'use client';

import React, { useState } from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { Button } from '../ui/Button';
import { 
  Flame, 
  Zap, 
  Sparkles, 
  X, 
  CheckCircle2, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  UserCheck, 
  CheckSquare, 
  RefreshCw, 
  DollarSign, 
  Database, 
  Server, 
  ArrowRight,
  Sliders,
  Layers,
  Clock
} from 'lucide-react';
import { RiskCategory, ProbabilityLevel, ImpactLevel } from '../../types/risk';

interface IncidentToRiskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface IncidentSample {
  title: string;
  service: string;
  severity: 'Critical' | 'Major' | 'Moderate' | 'Minor';
  text: string;
}

const SAMPLE_INCIDENTS: IncidentSample[] = [
  {
    title: 'PostgreSQL Read-Replica Lag & Cascading 504 Timeouts',
    service: 'Core Database & Checkout API',
    severity: 'Critical',
    text: `INCIDENT SUMMARY:
At 14:22 UTC, primary PostgreSQL node experienced an unindexed query spike from reporting worker pool.
Replication lag on secondary read-replicas surged to 480 seconds.
Application connection pool exhausted max pool size (200 conns).
Checkout service threw cascading 504 Gateway Timeouts for 38 minutes.
Estimated 1,420 user transactions dropped before manual kill of worker process and failover.`
  },
  {
    title: 'OAuth Token Signing Key Rotation Desync',
    service: 'Auth & IAM Gateway',
    severity: 'Major',
    text: `INCIDENT SUMMARY:
Automated quarterly KMS key rotation executed at 03:00 UTC.
Auth gateway caching layer failed to invalidate previous public JWKS key set due to stale Redis TTL (72h).
Microservices rejected incoming JWT signatures with HTTP 401 Unauthorized across all authenticated API calls.
Resolution required manual Redis cache flush and restarting 12 ingress pods.`
  },
  {
    title: 'Third-Party Webhook Surge Ingestion Backlog',
    service: 'Payment & Event Webhooks',
    severity: 'Major',
    text: `INCIDENT SUMMARY:
Partner webhook provider replayed 48 hours of batched settlement webhooks simultaneously (28,000 req/sec).
Webhook ingress queue exceeded memory allocation, triggering pod OOMKilled crash loop.
No backpressure or durable Kafka/SQS dead-letter queue was configured on the edge router.
Event processing stalled for 1.5 hours, delaying critical user balance reconciliations.`
  },
  {
    title: 'Kubernetes Ingress TLS Certificate Expiration',
    service: 'Edge Traffic & Ingress Router',
    severity: 'Moderate',
    text: `INCIDENT SUMMARY:
Production ingress SSL wildcard cert (*.mnbresearch.com) expired at 00:00 UTC.
Cert-manager ACME webhook failed DNS-01 verification challenge due to updated Cloudflare API tokens.
Browser clients received SSL_ERROR_BAD_CERT_DOMAIN security warnings.
Traffic dropped by 64% over a 22-minute window until automated challenge was re-authenticated.`
  }
];

export const IncidentToRiskModal: React.FC<IncidentToRiskModalProps> = ({ isOpen, onClose }) => {
  const { addRisk, addControl, addToast, projects, selectedProjectId } = useRiskContext();

  const [incidentTitle, setIncidentTitle] = useState<string>('');
  const [affectedService, setAffectedService] = useState<string>('Core Infrastructure');
  const [incidentSeverity, setIncidentSeverity] = useState<'Critical' | 'Major' | 'Moderate' | 'Minor'>('Major');
  const [incidentText, setIncidentText] = useState<string>('');

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzedRisk, setAnalyzedRisk] = useState<any>(null);
  const [providerInfo, setProviderInfo] = useState<string>('');
  const [createLinkedControl, setCreateLinkedControl] = useState<boolean>(true);
  const [isCommitting, setIsCommitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleApplySample = (sample: IncidentSample) => {
    setIncidentTitle(sample.title);
    setAffectedService(sample.service);
    setIncidentSeverity(sample.severity);
    setIncidentText(sample.text);
    setAnalyzedRisk(null);
  };

  const handleTransformIncident = async () => {
    if (!incidentText.trim() && !incidentTitle.trim()) {
      addToast('Input Required', 'Please provide an incident summary or select a sample scenario.', 'warning');
      return;
    }

    setIsAnalyzing(true);
    setAnalyzedRisk(null);
    addToast('Groq Qwen Incident Pipeline', 'Synthesizing ISO 31000 risk record from incident logs...', 'info');

    try {
      const res = await fetch('/api/incident-to-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentTitle,
          affectedService,
          incidentSeverity,
          incidentText
        })
      });

      if (!res.ok) {
        throw new Error(`API responded with ${res.status}`);
      }

      const data = await res.json();
      if (data.risk) {
        setAnalyzedRisk(data.risk);
        setProviderInfo(data.provider || 'Groq Qwen 27B');
        addToast('ISO 31000 Risk Synthesized', 'Incident post-mortem successfully converted to risk record.', 'success');
      } else {
        throw new Error(data.error || 'Failed to parse incident');
      }
    } catch (err: any) {
      console.error('Incident transformation failed:', err);
      addToast('Transformation Error', err.message || 'Failed to transform incident. Please try again.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCommitToRegister = async () => {
    if (!analyzedRisk) return;
    setIsCommitting(true);

    try {
      const targetProj = projects.find(p => p.id === selectedProjectId) || projects[0] || {
        id: 'proj-1',
        name: 'Project Alpha'
      };

      const prob = (analyzedRisk.probability || 3) as ProbabilityLevel;
      const imp = (analyzedRisk.impact || 3) as ImpactLevel;

      // Map owner to standard MNB team members
      const ownerName = analyzedRisk.suggestedOwner || 'Sunny Prasad';
      const ownerRole = analyzedRisk.suggestedOwnerRole || 'Risk Lead';

      // 1. Commit Risk to Enterprise Register
      const newRisk = await addRisk({
        title: analyzedRisk.title || `Post-Incident: ${incidentTitle}`,
        description: analyzedRisk.description || incidentText,
        category: (analyzedRisk.category || 'Operational') as RiskCategory,
        probability: prob,
        impact: imp,
        status: 'Open',
        projectId: targetProj.id,
        projectName: targetProj.name,
        ownerId: 'usr-incident-lead',
        ownerName,
        ownerRole,
        mitigationPlan: analyzedRisk.mitigationPlan || 'Proactive mitigation strategy pending.',
        contingencyPlan: analyzedRisk.contingencyPlan || 'Contingency fallback plan pending.',
        mitigationProgress: 0,
        checklist: analyzedRisk.checklist || [],
        activityLogs: [
          {
            id: `act-inc-${Date.now()}`,
            timestamp: 'Just now',
            author: 'Incident-to-Risk Pipeline (Groq Qwen)',
            action: `Transformed operational outage "${incidentTitle || 'Incident'}" into ISO 31000 Risk Record.`,
            type: 'creation'
          }
        ],
        aiSuggested: true,
        aiConfidence: 96,
        estimatedImpactUsd: analyzedRisk.estimatedImpactUsd || 25000
      });

      // 2. Optionally create and link recommended internal control
      if (createLinkedControl && analyzedRisk.recommendedControl && addControl) {
        const ctrlType = analyzedRisk.recommendedControl.type === 'Preventative' 
          ? 'Preventive' 
          : (analyzedRisk.recommendedControl.type || 'Preventive');

        await addControl({
          name: analyzedRisk.recommendedControl.title || `Control: ${analyzedRisk.title}`,
          description: analyzedRisk.recommendedControl.description || 'Automated preventative control derived from incident post-mortem.',
          category: analyzedRisk.category || 'Operational',
          type: ctrlType as 'Preventive' | 'Detective' | 'Corrective',
          objective: `Prevent recurrence of incident "${incidentTitle || analyzedRisk.title}".`,
          ownerName,
          ownerRole,
          implementationStatus: 'In Progress',
          effectiveness: 'Partially Effective',
          testStatus: 'Pending Test',
          linkedRiskIds: [newRisk.id]
        });
      }

      addToast(
        'Risk Committed to Register', 
        `Successfully registered ${newRisk.id}: "${newRisk.title}".`, 
        'success'
      );
      onClose();
    } catch (err: any) {
      console.error('Failed to commit risk:', err);
      addToast('Commit Failed', err.message || 'Could not commit risk to register.', 'error');
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-500 to-rose-600 text-white flex items-center justify-center font-bold shadow-md shadow-rose-950/20 shrink-0">
              <Flame className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  Incident-to-Risk Pipeline
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  ISO 31000 Engine
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Groq Qwen 27B
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Ingest raw outage reports, stack traces, and post-mortems to generate structured ISO 31000 risks, scores, and preventative controls.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split 2-Column Responsive Layout */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Input & Scenario Quick-Picks (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Quick Scenario Chips */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Load Sample Post-Mortem Scenario:</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_INCIDENTS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplySample(s)}
                    className="p-2 text-left rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-xs group"
                  >
                    <div className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {s.title}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-between">
                      <span>{s.service}</span>
                      <span className={`font-bold ${
                        s.severity === 'Critical' ? 'text-red-500' : 'text-amber-500'
                      }`}>
                        {s.severity}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Incident Title */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Incident Identifier / Title
              </label>
              <input
                type="text"
                value={incidentTitle}
                onChange={(e) => setIncidentTitle(e.target.value)}
                placeholder="e.g. INC-4091: Cloud SQL Multi-Region Deadlock"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Affected Service & Severity Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Affected Service
                </label>
                <input
                  type="text"
                  value={affectedService}
                  onChange={(e) => setAffectedService(e.target.value)}
                  placeholder="e.g. Core Settlement DB"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Incident Severity
                </label>
                <select
                  value={incidentSeverity}
                  onChange={(e) => setIncidentSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Critical">Critical (P1 Outage)</option>
                  <option value="Major">Major (P2 Disruption)</option>
                  <option value="Moderate">Moderate (P3 Degradation)</option>
                  <option value="Minor">Minor (P4 Transient)</option>
                </select>
              </div>
            </div>

            {/* Raw Incident Logs / Post-Mortem Text */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                  <span>Raw Post-Mortem, Logs or Slack Summary</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono-code">
                  {incidentText.length} chars
                </span>
              </div>
              <textarea
                rows={7}
                value={incidentText}
                onChange={(e) => setIncidentText(e.target.value)}
                placeholder="Paste outage timeline, incident commander notes, error stacktraces, or post-mortem RCAs here..."
                className="w-full p-3 text-xs font-mono-code rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-none"
              />
            </div>

            {/* Trigger Button */}
            <Button
              variant="primary"
              onClick={handleTransformIncident}
              disabled={isAnalyzing}
              className="w-full justify-center bg-linear-to-r from-rose-600 via-amber-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-bold py-2.5 shadow-md shadow-rose-950/10"
              icon={isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            >
              {isAnalyzing ? 'Analyzing Incident with Groq Qwen...' : 'Transform Incident with Groq Qwen'}
            </Button>
          </div>

          {/* RIGHT COLUMN: Real-Time ISO 31000 Risk Synthesizer Output (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            {analyzedRisk ? (
              <div className="space-y-4 animate-in fade-in-50">
                
                {/* Meta Header / Engine Status */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Engine: <strong className="text-slate-900 dark:text-white font-mono-code">{providerInfo}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      ISO 31000 Compliant
                    </span>
                  </div>
                </div>

                {/* Risk Title & Score Pill Header */}
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {analyzedRisk.category} Risk
                      </span>
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-1">
                        {analyzedRisk.title}
                      </h3>
                    </div>

                    {/* Inherent Score Pill */}
                    <div className="text-right shrink-0">
                      <div className={`px-2.5 py-1 rounded-xl font-black text-xs inline-flex items-center gap-1.5 ${
                        analyzedRisk.severity === 'Critical' 
                          ? 'bg-red-500 text-white' 
                          : analyzedRisk.severity === 'High' 
                          ? 'bg-amber-500 text-white' 
                          : 'bg-emerald-600 text-white'
                      }`}>
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Score: {analyzedRisk.score} / 25 ({analyzedRisk.severity})</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        P: {analyzedRisk.probability}/5 · I: {analyzedRisk.impact}/5
                      </div>
                    </div>
                  </div>

                  {/* Executive Threat Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    {analyzedRisk.description}
                  </p>

                  {/* Root Cause Callout */}
                  <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2 text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-rose-900 dark:text-rose-300 font-bold">Identified Root Cause: </strong>
                      <span className="text-rose-800 dark:text-rose-300/90">{analyzedRisk.rootCause}</span>
                    </div>
                  </div>

                  {/* Key Assignment & Financial Exposure */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-indigo-500" />
                        <span>Assigned Risk Owner</span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                        {analyzedRisk.suggestedOwner}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {analyzedRisk.suggestedOwnerRole}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-emerald-500" />
                        <span>Estimated Recurrence Exposure</span>
                      </div>
                      <div className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5 font-mono-code">
                        ${(analyzedRisk.estimatedImpactUsd || 25000).toLocaleString()} USD
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Annualized Loss Expectancy
                      </div>
                    </div>
                  </div>

                  {/* Remediation Action Checklist */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Synthesized Remediation Checklist ({analyzedRisk.checklist?.length || 0} tasks):</span>
                    </label>
                    <div className="space-y-1.5">
                      {analyzedRisk.checklist?.map((task: any, idx: number) => (
                        <div
                          key={task.id || idx}
                          className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-xs"
                        >
                          <span className="w-4 h-4 rounded-md border border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0 bg-white dark:bg-slate-800 text-[10px] font-bold text-slate-500">
                            {idx + 1}
                          </span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">
                            {task.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Internal Control Card */}
                  {analyzedRisk.recommendedControl && (
                    <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950 dark:text-indigo-200">
                          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <span>Recommended Internal Control:</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                          {analyzedRisk.recommendedControl.type}
                        </span>
                      </div>
                      
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {analyzedRisk.recommendedControl.title}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        {analyzedRisk.recommendedControl.description}
                      </p>

                      <label className="flex items-center gap-2 pt-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={createLinkedControl}
                          onChange={(e) => setCreateLinkedControl(e.target.checked)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                        />
                        <span className="text-[11px] font-semibold text-indigo-900 dark:text-indigo-300">
                          Auto-create & link this control in the Internal Controls Register
                        </span>
                      </label>
                    </div>
                  )}

                </div>

                {/* Bottom Commit Action */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setAnalyzedRisk(null)}
                    disabled={isCommitting}
                  >
                    Discard & Re-analyze
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleCommitToRegister}
                    disabled={isCommitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    icon={isCommitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  >
                    {isCommitting ? 'Committing to Register...' : 'Commit to Enterprise Register'}
                  </Button>
                </div>

              </div>
            ) : (
              /* Empty State Placeholder */
              <div className="h-full min-h-[380px] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-slate-900/40">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 shadow-inner">
                  <Flame className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Ready for Incident Ingestion
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
                  Paste raw outage post-mortems or click one of the quick scenario chips on the left to transform outages into ISO 31000 risk records.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-md text-left">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px]">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
                      <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                      <span>5x5 Scoring</span>
                    </div>
                    <span className="text-slate-500 dark:text-slate-400">Automatic P×I inherent score & severity classification.</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px]">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
                      <Layers className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Control Link</span>
                    </div>
                    <span className="text-slate-500 dark:text-slate-400">Synthesizes preventative & detective internal controls.</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px]">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      <span>Execution Tasks</span>
                    </div>
                    <span className="text-slate-500 dark:text-slate-400">Generates 3-4 remediation checklist action items.</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
