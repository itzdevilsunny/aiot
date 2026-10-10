'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RiskItem, StatusLevel, TreatmentStrategy, LifecycleStage } from '../../types/risk';
import { useRiskContext } from '../../context/RiskContext';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { JiraTicketModal } from './JiraTicketModal';
import { AIRedTeamerModal } from './AIRedTeamerModal';
import { SLABreachGuardModal } from './SLABreachGuardModal';
import { RiskLifecycleStepper } from './RiskLifecycleStepper';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  User, 
  Trash2, 
  Sparkles, 
  ShieldAlert, 
  CheckSquare, 
  Square,
  TrendingUp,
  FileText,
  Code2,
  Plus,
  Crosshair,
  ShieldCheck,
  AlertTriangle,
  ClipboardList,
  ExternalLink,
  ChevronRight,
  Shield,
  FileCheck,
  Send
} from 'lucide-react';

interface RiskDetailProps {
  risk: RiskItem;
}

export const RiskDetail: React.FC<RiskDetailProps> = ({ risk }) => {
  const router = useRouter();
  const { 
    controls,
    actions,
    evidence,
    approvals,
    kris,
    workspaceSettings,
    currentUser,
    createApprovalRequest,
    updateRiskStatus, 
    toggleChecklistItem, 
    deleteRisk, 
    addToast, 
    updateRisk, 
    formatCurrency 
  } = useRiskContext();

  const [isEditing, setIsEditing] = useState(false);
  const [isJiraModalOpen, setIsJiraModalOpen] = useState(false);
  const [isRedTeamerOpen, setIsRedTeamerOpen] = useState(false);
  const [isSlaModalOpen, setIsSlaModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  // Form states for editing
  const [titleInput, setTitleInput] = useState(risk.title);
  const [descInput, setDescInput] = useState(risk.description);
  const [mitigationInput, setMitigationInput] = useState(risk.mitigationPlan);
  const [contingencyInput, setContingencyInput] = useState(risk.contingencyPlan);
  const [treatmentStrategy, setTreatmentStrategy] = useState<TreatmentStrategy>(risk.treatmentStrategy || 'Mitigate');
  const [newChecklistText, setNewChecklistText] = useState('');
  const [isGeneratingChecklist, setIsGeneratingChecklist] = useState(false);

  // Approval form state
  const [approvalReason, setApprovalReason] = useState(`Residual score (${risk.residualScore || risk.score}) exceeds risk appetite (${workspaceSettings.riskAppetiteThreshold}).`);
  const [compensatingControls, setCompensatingControls] = useState('Increased audit logging and weekly operational monitoring.');

  // Linked Entities
  const linkedControls = (controls || []).filter(c => c?.linkedRiskIds?.includes(risk.id) || (c as any)?.linkedRiskId === risk.id);
  const linkedActions = (actions || []).filter(a => a?.riskId === risk.id || (a as any)?.linkedRiskId === risk.id);
  const linkedEvidence = (evidence || []).filter(e => e?.linkedRiskId === risk.id || (e as any)?.linkedRiskIds?.includes(risk.id));
  const linkedKris = (kris || []).filter(k => k?.linkedRiskId === risk.id);
  const linkedApprovals = (approvals || []).filter(a => a?.riskId === risk.id);
  const latestApproval = linkedApprovals.length > 0 ? linkedApprovals[linkedApprovals.length - 1] : undefined;

  const handleUpdateLifecycleStage = (stage: LifecycleStage) => {
    updateRisk(risk.id, { lifecycleStage: stage });
    addToast('Lifecycle Stage Advanced', `Risk transitioned to ${stage} stage.`, 'success');
  };

  const inherentScore = risk.inherentScore || (risk.probability * risk.impact);
  const residualScore = risk.residualScore || risk.score;
  const isAboveAppetite = residualScore > workspaceSettings.riskAppetiteThreshold;

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;

    const newItem = {
      id: `chk-${Date.now()}`,
      title: newChecklistText.trim(),
      completed: false
    };

    const updatedChecklist = [...risk.checklist, newItem];
    const completedCount = updatedChecklist.filter(c => c.completed).length;
    const progress = Math.round((completedCount / updatedChecklist.length) * 100);

    updateRisk(risk.id, {
      checklist: updatedChecklist,
      mitigationProgress: progress
    });

    setNewChecklistText('');
    addToast('Action Item Added', 'New task appended to mitigation checklist.', 'success');
  };

  const handleAIGenerateChecklist = async () => {
    setIsGeneratingChecklist(true);
    addToast('AI Synthesizing Execution Checklist', 'Generating tailored task items based on threat scope...', 'info');

    setTimeout(() => {
      const aiGeneratedItems = [
        { id: `chk-${Date.now()}-1`, title: `Conduct security vulnerability audit for ${risk.title}`, completed: false },
        { id: `chk-${Date.now()}-2`, title: `Formulate failover procedure & update runbook with ${risk.ownerName}`, completed: false },
        { id: `chk-${Date.now()}-3`, title: `Establish real-time latency monitoring & alert threshold`, completed: false }
      ];

      const updatedChecklist = [...risk.checklist, ...aiGeneratedItems];
      const completedCount = updatedChecklist.filter(c => c.completed).length;
      const progress = Math.round((completedCount / updatedChecklist.length) * 100);

      updateRisk(risk.id, {
        checklist: updatedChecklist,
        mitigationProgress: progress
      });

      setIsGeneratingChecklist(false);
      addToast('AI Execution Tasks Appended', 'Added 3 structured action items to checklist.', 'success');
    }, 800);
  };

  const handleSaveEdits = () => {
    updateRisk(risk.id, {
      title: titleInput,
      description: descInput,
      mitigationPlan: mitigationInput,
      contingencyPlan: contingencyInput,
      treatmentStrategy: treatmentStrategy
    });
    setIsEditing(false);
    addToast('Risk Updated', 'Risk details and strategy saved successfully.', 'success');
  };

  const handleApplyCopilotRec = () => {
    updateRisk(risk.id, {
      probability: Math.max(1, risk.probability - 1) as any,
      residualProbability: Math.max(1, (risk.residualProbability || risk.probability) - 1) as any,
      mitigationProgress: Math.min(100, risk.mitigationProgress + 20)
    });
    addToast('Copilot Recommendation Applied', 'Risk probability reduced and progress updated.', 'success');
  };

  const handleCreateApproval = (e: React.FormEvent) => {
    e.preventDefault();
    createApprovalRequest({
      riskId: risk.id,
      riskTitle: risk.title,
      type: 'Risk Acceptance',
      requestedBy: currentUser.name,
      approverName: 'Chief Risk Officer',
      residualScore: residualScore,
      reason: `${approvalReason} | Compensating Controls: ${compensatingControls}`,
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    // Dispatch webhook notification to Governance and Approver channels
    fetch('/api/notify-escalation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'APPROVAL_REQUESTED',
        riskId: risk.id,
        title: risk.title,
        ownerName: currentUser.name,
        score: residualScore,
        severity: risk.residualSeverity || risk.severity,
        category: risk.category,
        reason: `Formal Risk Acceptance requested: ${approvalReason}`
      })
    }).catch(err => console.warn('Approval notification dispatch note:', err));

    setIsApprovalModalOpen(false);
    addToast('Approval Request Submitted', 'Submitted for executive governance review and alerted approver channels.', 'success');
  };

  return (
    <>
      <JiraTicketModal
        isOpen={isJiraModalOpen}
        onClose={() => setIsJiraModalOpen(false)}
        risk={risk}
      />
      <AIRedTeamerModal
        isOpen={isRedTeamerOpen}
        onClose={() => setIsRedTeamerOpen(false)}
        risk={risk}
      />
      <SLABreachGuardModal
        isOpen={isSlaModalOpen}
        onClose={() => setIsSlaModalOpen(false)}
        risk={risk}
      />

      {/* Governance Approval Request Modal */}
      {isApprovalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Request Formal Risk Acceptance</h3>
                  <p className="text-[11px] text-slate-500">Governance sign-off for residual score &gt; {workspaceSettings.riskAppetiteThreshold}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsApprovalModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateApproval} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Business Justification / Reason</label>
                <textarea
                  rows={3}
                  value={approvalReason}
                  onChange={(e) => setApprovalReason(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Compensating Controls</label>
                <textarea
                  rows={2}
                  value={compensatingControls}
                  onChange={(e) => setCompensatingControls(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsApprovalModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" icon={<Send className="w-3.5 h-3.5" />}>
                  Submit for Approval
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Risk Register</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href={`/audit-logs`}>
              <Button
                variant="outline"
                size="sm"
                icon={<ClipboardList className="w-3.5 h-3.5 text-indigo-600" />}
              >
                SOC 2 Audit Trail
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              icon={<Clock className="w-3.5 h-3.5 text-amber-600" />}
              onClick={() => setIsSlaModalOpen(true)}
            >
              SLA Predictor
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={<Crosshair className="w-3.5 h-3.5 text-purple-600" />}
              onClick={() => setIsRedTeamerOpen(true)}
            >
              AI Red-Teamer
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={<Code2 className="w-3.5 h-3.5 text-indigo-600" />}
              onClick={() => setIsJiraModalOpen(true)}
            >
              Jira Ticket
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel Editing' : 'Edit Risk Record'}
            </Button>

            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => {
                if (confirm(`Delete risk item ${risk.id}?`)) {
                  deleteRisk(risk.id);
                  router.push('/register');
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Risk Appetite Warning Banner */}
        {isAboveAppetite && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-600 text-white shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-red-950 text-sm">
                  Risk Appetite Threshold Exceeded (Residual Score: {residualScore} / Appetite: {workspaceSettings.riskAppetiteThreshold})
                </div>
                <div className="text-red-700 font-medium mt-0.5">
                  This risk requires formal Risk Acceptance sign-off from a Risk Manager or Chief Risk Officer.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {latestApproval ? (
                <Link
                  href="/approvals"
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Approval {latestApproval.status}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              ) : (
                <button
                  onClick={() => setIsApprovalModalOpen(true)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Request Approval</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main Header Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                {risk.id}
              </span>
              <Badge variant="category">{risk.category}</Badge>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                Strategy: {risk.treatmentStrategy || 'Mitigate'}
              </span>
              <span className="text-xs text-slate-500 font-medium">Project: {risk.projectName}</span>
            </div>

            {/* Status Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Status:</span>
              <select
                value={risk.status}
                onChange={(e) => updateRiskStatus(risk.id, e.target.value as StatusLevel)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="Open">Open</option>
                <option value="Monitoring">Monitoring</option>
                <option value="Mitigated">Mitigated</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          {!isEditing ? (
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                {risk.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {risk.description}
              </p>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Treatment Strategy</label>
                <select
                  value={treatmentStrategy}
                  onChange={(e) => setTreatmentStrategy(e.target.value as TreatmentStrategy)}
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 font-medium bg-white"
                >
                  <option value="Mitigate">Mitigate</option>
                  <option value="Avoid">Avoid</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Accept">Accept</option>
                </select>
              </div>
              <Button variant="primary" size="sm" onClick={handleSaveEdits}>
                Save Updates
              </Button>
            </div>
          )}
        </div>

        {/* 10-STEP CONTINUOUS OPERATING LIFECYCLE & RELATIONSHIP CHAIN */}
        <RiskLifecycleStepper
          risk={risk}
          linkedControls={linkedControls}
          linkedActions={linkedActions}
          linkedEvidence={linkedEvidence}
          linkedKris={linkedKris}
          linkedApproval={latestApproval}
          onUpdateStage={handleUpdateLifecycleStage}
        />

        {/* INHERENT VS RESIDUAL SCORING GAUGE */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Inherent vs. Residual Risk Scoring Matrix</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">
              Appetite Threshold: <strong className="text-slate-800 font-mono">{workspaceSettings.riskAppetiteThreshold}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inherent Exposure */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Inherent Risk (Pre-Controls)</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold text-white ${
                  inherentScore >= 16 ? 'bg-red-600' : inherentScore >= 10 ? 'bg-orange-600' : 'bg-emerald-600'
                }`}>
                  Score {inherentScore}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-700 pt-1">
                <div>Probability: <strong className="font-mono text-slate-900">{risk.inherentProbability || risk.probability}/5</strong></div>
                <div>Impact: <strong className="font-mono text-slate-900">{risk.inherentImpact || risk.impact}/5</strong></div>
              </div>
              <p className="text-[11px] text-slate-500">
                Baseline exposure without active controls or countermeasures.
              </p>
            </div>

            {/* Residual Exposure */}
            <div className={`p-4 rounded-xl border space-y-2 ${
              isAboveAppetite ? 'bg-red-50/50 border-red-200' : 'bg-emerald-50/40 border-emerald-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Residual Risk (Post-Controls)</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold border ${
                  isAboveAppetite ? 'bg-red-100 text-red-800 border-red-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  Score {residualScore}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-700 pt-1">
                <div>Probability: <strong className="font-mono text-slate-900">{risk.residualProbability || risk.probability}/5</strong></div>
                <div>Impact: <strong className="font-mono text-slate-900">{risk.residualImpact || risk.impact}/5</strong></div>
                <div className="ml-auto font-mono font-bold text-slate-900">
                  {formatCurrency(risk.estimatedImpactUsd || (residualScore * 2500))}
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Remaining exposure after evaluating {linkedControls.length} linked control(s).
              </p>
            </div>
          </div>
        </div>

        {/* 3 OPERATIONAL LIFECYCLE SECTIONS: CONTROLS, ACTIONS, EVIDENCE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1. Linked Controls */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-extrabold text-slate-900">Internal Controls ({linkedControls.length})</h4>
              </div>
              <Link href="/controls" className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center">
                <span>Manage</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {linkedControls.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No controls directly mapped.</p>
            ) : (
              <div className="space-y-2">
                {linkedControls.map(c => (
                  <div key={c.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-indigo-700">{c.id}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        c.testStatus === 'Passed' ? 'bg-emerald-100 text-emerald-800' :
                        c.testStatus === 'Failed' ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {c.testStatus}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 mt-1 truncate">{c.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {c.type} • {c.effectiveness}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Linked Mitigation Actions */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-extrabold text-slate-900">Mitigation Actions ({linkedActions.length})</h4>
              </div>
              <Link href="/actions" className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center">
                <span>Manage</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {linkedActions.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No mitigation actions assigned.</p>
            ) : (
              <div className="space-y-2">
                {linkedActions.map(a => (
                  <div key={a.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 truncate">{a.title}</span>
                      <span className="font-mono text-[10px] font-extrabold text-indigo-700">{a.progressPct}%</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>Owner: {a.assignedOwnerName}</span>
                      <span>Due: {a.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Linked Audit Evidence */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-extrabold text-slate-900">Audit Evidence ({linkedEvidence.length})</h4>
              </div>
              <Link href="/evidence" className="text-[10px] font-bold text-blue-600 hover:underline flex items-center">
                <span>Manage</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {linkedEvidence.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No evidence artifacts attached.</p>
            ) : (
              <div className="space-y-2">
                {linkedEvidence.map(e => (
                  <div key={e.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                    <div className="font-bold text-slate-900 truncate">{e.description || e.fileName}</div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>{e.fileName}</span>
                      <span className="text-emerald-600 font-semibold">{e.verificationStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Grid Layout: Left Column (Mitigation Checklist) / Right Column (Ownership, Timeline, Copilot) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mitigation Strategy & Checklist */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Proactive Mitigation Plan</span>
                </h3>
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {risk.mitigationProgress}% Completed
                </span>
              </div>

              {!isEditing ? (
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-medium">
                  {risk.mitigationPlan}
                </p>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Edit Mitigation Plan</label>
                  <textarea
                    rows={3}
                    value={mitigationInput}
                    onChange={(e) => setMitigationInput(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300 font-medium"
                  />
                </div>
              )}

              {/* Execution Checklist */}
              <div className="pt-2 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Execution Checklist ({risk.checklist.filter(c => c.completed).length} / {risk.checklist.length})
                  </h4>

                  <Button
                    variant="copilot"
                    size="sm"
                    disabled={isGeneratingChecklist}
                    icon={<Sparkles className="w-3.5 h-3.5 text-indigo-200" />}
                    onClick={handleAIGenerateChecklist}
                  >
                    {isGeneratingChecklist ? 'Synthesizing...' : 'AI Generate Action Items'}
                  </Button>
                </div>

                {/* Add Custom Task Form */}
                <form onSubmit={handleAddChecklistItem} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add a new mitigation action task..."
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                  <Button variant="outline" size="sm" type="submit" icon={<Plus className="w-3.5 h-3.5 text-indigo-600" />}>
                    Add Task
                  </Button>
                </form>

                <div className="space-y-2">
                  {risk.checklist.map(item => (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklistItem(risk.id, item.id)}
                      className="flex items-start gap-3 p-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      <button className="mt-0.5 text-indigo-600 shrink-0">
                        {item.completed ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />}
                      </button>
                      <div className="flex-1 text-xs">
                        <span className={`font-semibold text-slate-800 ${item.completed ? 'line-through text-slate-400' : ''}`}>
                          {item.title}
                        </span>
                        {item.completedAt && (
                          <span className="text-[10px] text-slate-400 ml-2">Completed {item.completedAt}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contingency Plan */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Contingency Fallback Plan</span>
                </h3>
              </div>
              {!isEditing ? (
                <p className="text-xs text-slate-700 leading-relaxed p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/60 font-medium">
                  {risk.contingencyPlan}
                </p>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Edit Contingency Plan</label>
                  <textarea
                    rows={2}
                    value={contingencyInput}
                    onChange={(e) => setContingencyInput(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300 font-medium"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column (1/3 width): Ownership, Copilot Insights, Timeline */}
          <div className="space-y-6">
            {/* Ownership & Backup */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-600" />
                <span>Ownership & Accountable Lead</span>
              </h3>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                {risk.ownerAvatar ? (
                  <img src={risk.ownerAvatar} alt={risk.ownerName} className="w-10 h-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {risk.ownerName.charAt(0)}
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Primary Risk Owner</span>
                  <h4 className="text-xs font-bold text-slate-900">{risk.ownerName}</h4>
                  <p className="text-[11px] text-slate-500">{risk.ownerRole}</p>
                </div>
              </div>

              {risk.coOwnerName && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {risk.coOwnerName.charAt(0)}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Backup Co-Owner</span>
                    <h4 className="text-xs font-bold text-slate-800">{risk.coOwnerName}</h4>
                    <p className="text-[10px] text-slate-500">{risk.coOwnerRole}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Copilot Recommendation Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Copilot Telemetry Insight</span>
              </div>
              <p className="text-xs text-indigo-950 leading-relaxed font-medium">
                Executing the linked mitigation actions is projected to reduce probability to <strong className="font-mono">2</strong>, bringing residual exposure safely within appetite.
              </p>
              <Button
                variant="copilot"
                size="sm"
                className="w-full text-xs"
                onClick={handleApplyCopilotRec}
              >
                Apply Recommended Reduction
              </Button>
            </div>

            {/* Section 6: Activity & Audit Timeline */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <span>Activity & Audit Trail</span>
                </h3>
                <Link href="/audit-logs" className="text-[10px] font-bold text-indigo-600 hover:underline">
                  Full Log
                </Link>
              </div>

              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {risk.activityLogs.map((log, idx) => (
                  <div key={`${log.id || 'log'}-${idx}`} className="relative pl-7 text-xs">
                    <div className="absolute left-1.5 top-1 w-3 h-3 rounded-full bg-slate-900 ring-4 ring-white" />
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-semibold text-slate-700">{log.author}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <p className="text-slate-600 mt-0.5 font-medium">{log.action}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
