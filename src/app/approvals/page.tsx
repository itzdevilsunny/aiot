'use client';

import React, { useState } from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileCheck, 
  UserCheck, 
  MessageSquare,
  Send,
  Plus
} from 'lucide-react';

export default function ApprovalsPage() {
  const { approvals, reviews, risks, createApprovalRequest, updateApprovalStatus, addReview, currentUser } = useRiskContext();
  const [activeTab, setActiveTab] = useState<'approvals' | 'reviews'>('approvals');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [decisionComment, setDecisionComment] = useState('');

  // Request form state
  const [riskId, setRiskId] = useState(risks[0]?.id || '');
  const [type, setType] = useState<'Risk Acceptance' | 'Score Change' | 'Treatment Sign-off'>('Risk Acceptance');
  const [approverName, setApproverName] = useState('Sumit (Resource Manager)');
  const [reason, setReason] = useState('');

  const pendingApprovals = approvals.filter(a => a.status === 'Pending');
  const decidedApprovals = approvals.filter(a => a.status !== 'Pending');

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!riskId || !reason.trim()) return;

    const targetRisk = risks.find(r => r.id === riskId);

    createApprovalRequest({
      riskId,
      riskTitle: targetRisk?.title || 'Target Risk',
      type,
      requestedBy: currentUser.name,
      approverName,
      residualScore: targetRisk?.residualScore || 12,
      reason
    });

    setIsModalOpen(false);
    setReason('');
  };

  const handleDecision = (id: string, status: 'Approved' | 'Rejected') => {
    updateApprovalStatus(id, status, decisionComment || undefined);
    setRejectModalId(null);
    setDecisionComment('');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Governance, Reviews & Approvals</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Formal risk reviews, residual risk acceptance sign-offs, and administrative score approvals.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Request Risk Acceptance</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`pb-3 px-3 transition-colors border-b-2 ${
            activeTab === 'approvals'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Pending Approvals & Sign-offs ({pendingApprovals.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 px-3 transition-colors border-b-2 ${
            activeTab === 'reviews'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Scheduled Risk Reviews ({reviews.length})
        </button>
      </div>

      {/* Approvals Tab Content */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          {/* Pending Approval Cards */}
          <div>
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
              Pending Management Sign-off ({pendingApprovals.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingApprovals.map((req) => (
                <div key={req.id} className="bg-white p-5 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-mono font-bold rounded text-[10px]">
                        {req.type}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{req.riskTitle}</h4>
                      <div className="text-[11px] text-slate-500 font-mono">Risk ID: {req.riskId}</div>
                    </div>
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-extrabold shrink-0">
                      Pending
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
                    <span className="font-semibold text-slate-900 block mb-0.5">Rationale / Justification:</span>
                    <p className="italic text-slate-600">{req.reason}</p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                    <div>Requested by: <span className="font-semibold text-slate-800">{req.requestedBy}</span></div>
                    <div>Approver: <span className="font-semibold text-slate-800">{req.approverName}</span></div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => setRejectModalId(req.id)}
                      className="px-3 py-1.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Reject Request
                    </button>
                    <button
                      onClick={() => handleDecision(req.id, 'Approved')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve Sign-off
                    </button>
                  </div>
                </div>
              ))}
              {pendingApprovals.length === 0 && (
                <div className="col-span-2 p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                  No pending approval requests. All risk acceptance decisions are up to date.
                </div>
              )}
            </div>
          </div>

          {/* History of Decisions */}
          <div>
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
              Completed Approval History ({decidedApprovals.length})
            </h3>
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="px-5 py-3">Risk & Type</th>
                    <th className="px-4 py-3">Requested By</th>
                    <th className="px-4 py-3">Approver</th>
                    <th className="px-4 py-3">Decision</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {decidedApprovals.map((req) => (
                    <tr key={req.id}>
                      <td className="px-5 py-3 font-semibold text-slate-900">
                        {req.riskTitle} ({req.type})
                      </td>
                      <td className="px-4 py-3 text-slate-700">{req.requestedBy}</td>
                      <td className="px-4 py-3 text-slate-700">{req.approverName}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {req.decidedTimestamp ? new Date(req.decidedTimestamp).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Completed Risk Review Records</h3>
          <div className="divide-y divide-slate-100">
            {reviews.map((rev) => (
              <div key={rev.id} className="py-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-xs">{rev.riskTitle}</div>
                  <span className="text-[10px] font-mono text-slate-500">{rev.reviewDate}</span>
                </div>
                <div className="text-xs text-slate-600">{rev.summary}</div>
                <div className="text-[11px] text-indigo-600 font-medium">Reviewer: {rev.reviewerName} ({rev.reviewerRole})</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-popover border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Request Formal Risk Acceptance</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Risk</label>
                <select
                  value={riskId}
                  onChange={e => setRiskId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                >
                  {risks.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.id}: {r.title} (Residual Score: {r.residualScore})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Request Type</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                >
                  <option value="Risk Acceptance">Risk Acceptance (Above Appetite)</option>
                  <option value="Score Change">Score Change Approval</option>
                  <option value="Treatment Sign-off">Treatment Strategy Sign-off</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Approver</label>
                <input
                  type="text"
                  value={approverName}
                  onChange={e => setApproverName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Governance Rationale / Business Justification</label>
                <textarea
                  rows={3}
                  required
                  placeholder="State business reason for accepting residual risk exposure..."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal with Comments */}
      {rejectModalId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-popover border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">Reject Risk Acceptance Request</h4>
            <p className="text-xs text-slate-500">Please provide mandatory rejection comments for audit trail.</p>
            <textarea
              rows={2}
              placeholder="e.g. Additional controls must be implemented before acceptance..."
              value={decisionComment}
              onChange={e => setDecisionComment(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectModalId(null)}
                className="px-3 py-1.5 border rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDecision(rejectModalId, 'Rejected')}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
