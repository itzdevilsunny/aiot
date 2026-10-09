'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RiskItem, StatusLevel } from '../../types/risk';
import { Badge } from '../ui/Badge';
import { useRiskContext } from '../../context/RiskContext';
import { EditRiskModal } from './EditRiskModal';
import { 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Trash2, 
  Sparkles, 
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit2,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  CheckSquare
} from 'lucide-react';

interface RiskTableProps {
  risks: RiskItem[];
}

export const RiskTable: React.FC<RiskTableProps> = ({ risks }) => {
  const router = useRouter();
  const { updateRiskStatus, deleteRisk, workspaceSettings, controls, actions, evidence } = useRiskContext();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingRisk, setEditingRisk] = useState<RiskItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(risks.length / itemsPerPage) || 1;
  const paginatedRisks = risks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderLevelBars = (level: number, activeColor: string) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`w-2 h-1.5 rounded-xs transition-colors ${
              i <= level ? activeColor : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
    );
  };

  if (risks.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-card">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">No risks match the active filter parameters</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Try resetting your category, status, or search query to view all project threats.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-card overflow-hidden">
        {/* Desktop Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-10 text-center">ID</th>
                <th className="py-3 px-4">Risk Title & Process</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Inherent Risk</th>
                <th className="py-3 px-4">Residual Risk</th>
                <th className="py-3 px-4">Strategy & Appetite</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedRisks.map((risk, idx) => {
                const isExpanded = expandedId === risk.id;
                const isAboveAppetite = risk.aboveAppetite || ((risk.residualScore ?? risk.score) > workspaceSettings.riskAppetiteThreshold);

                const linkedCtrls = controls.filter(c => c.linkedRiskIds?.includes(risk.id));
                const linkedActs = actions.filter(a => a.riskId === risk.id);
                const linkedEvs = evidence.filter(e => e.linkedRiskId === risk.id);

                return (
                  <React.Fragment key={`${risk.id}-${idx}`}>
                    <tr className={`hover:bg-slate-50/80 transition-colors ${isExpanded ? 'bg-slate-50/60' : ''}`}>
                      {/* Toggle Expand */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500 text-center">
                        <button
                          onClick={() => toggleExpand(risk.id)}
                          className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                          title="Toggle Details"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </td>

                      {/* Risk Title & Department */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="flex items-start gap-2">
                          <span className="font-mono text-[10px] text-slate-400 mt-0.5">{risk.id}</span>
                          <div>
                            <button
                              onClick={() => router.push(`/risk/${risk.id}`)}
                              className="font-bold text-slate-900 hover:text-indigo-600 text-left transition-colors flex items-center gap-1.5"
                            >
                              <span>{risk.title}</span>
                              {risk.aiSuggested && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  Copilot AI
                                </span>
                              )}
                            </button>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {risk.department || 'MNB Research'} • {risk.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge variant="category">{risk.category}</Badge>
                      </td>

                      {/* Inherent Score */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-mono font-extrabold text-white ${
                            risk.inherentSeverity === 'Critical' ? 'bg-red-600' :
                            risk.inherentSeverity === 'High' ? 'bg-orange-600' :
                            risk.inherentSeverity === 'Medium' ? 'bg-amber-600' : 'bg-emerald-600'
                          }`}>
                            {risk.inherentScore}
                          </span>
                          <div className="text-[10px] font-semibold text-slate-500">
                            P:{risk.inherentProbability} × I:{risk.inherentImpact}
                          </div>
                        </div>
                      </td>

                      {/* Residual Score */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-mono font-extrabold border ${
                            risk.residualSeverity === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                            risk.residualSeverity === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            risk.residualSeverity === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {risk.residualScore}
                          </span>
                          <div className="text-[10px] font-semibold text-slate-500">
                            P:{risk.residualProbability} × I:{risk.residualImpact}
                          </div>
                        </div>
                      </td>

                      {/* Strategy, Appetite & Lifecycle Stage */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 block w-fit">
                              {risk.treatmentStrategy || 'Mitigate'}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {risk.lifecycleStage || (risk.status === 'Closed' ? 'Close' : isAboveAppetite ? 'Approve' : 'Monitor')}
                            </span>
                          </div>
                          {isAboveAppetite ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-red-100 text-red-700 inline-flex items-center gap-1">
                              <AlertTriangle className="w-2.5 h-2.5" /> Above Appetite
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                              Within Appetite
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Owner */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {risk.ownerAvatar ? (
                            <img src={risk.ownerAvatar} alt={risk.ownerName} className="w-6 h-6 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                              {risk.ownerName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-slate-900 text-[11px]">{risk.ownerName}</div>
                            <div className="text-[10px] text-slate-500">{risk.ownerRole}</div>
                          </div>
                        </div>
                      </td>

                      {/* Status Selector */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={risk.status}
                          onChange={(e) => updateRiskStatus(risk.id, e.target.value as StatusLevel)}
                          className={`text-xs font-semibold px-2 py-1 rounded-md border cursor-pointer focus:outline-none ${
                            risk.status === 'Open' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                            risk.status === 'Monitoring' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            risk.status === 'Mitigated' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <option value="Open">Open</option>
                          <option value="Monitoring">Monitoring</option>
                          <option value="Mitigated">Mitigated</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingRisk(risk)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Risk"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => router.push(`/risk/${risk.id}`)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Open Detail View"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${risk.id}?`)) {
                                deleteRisk(risk.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Risk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Row Details */}
                    {isExpanded && (
                      <tr className="bg-slate-50/90 border-b border-slate-200 animate-in fade-in-50">
                        <td colSpan={9} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            {/* Proactive Strategy & Controls */}
                            <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200">
                              <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Linked Controls ({linkedCtrls.length})
                              </h5>
                              {linkedCtrls.length > 0 ? (
                                <div className="space-y-1">
                                  {linkedCtrls.map(c => (
                                    <div key={c.id} className="p-1.5 bg-slate-50 border rounded text-[11px]">
                                      <div className="font-bold text-slate-800">{c.name}</div>
                                      <div className="text-[10px] text-slate-500">{c.type} • {c.effectiveness}</div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[11px] text-slate-400 italic">No controls linked yet.</p>
                              )}
                            </div>

                            {/* Mitigation Actions */}
                            <div className="bg-white p-3 rounded-xl border border-slate-200">
                              <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-indigo-600" /> Linked Actions ({linkedActs.length})
                              </h5>
                              {linkedActs.length > 0 ? (
                                <div className="space-y-1">
                                  {linkedActs.map(a => (
                                    <div key={a.id} className="p-1.5 bg-slate-50 border rounded text-[11px] flex justify-between">
                                      <div>
                                        <div className="font-bold text-slate-800">{a.title}</div>
                                        <div className="text-[10px] text-slate-500">Due: {a.dueDate}</div>
                                      </div>
                                      <span className="font-bold text-indigo-600">{a.progressPct}%</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[11px] text-slate-400 italic">No mitigation actions defined yet.</p>
                              )}
                            </div>

                            {/* Evidence Files & Details */}
                            <div className="bg-white p-3 rounded-xl border border-slate-200">
                              <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                                <FileCheck className="w-3.5 h-3.5 text-indigo-600" /> Linked Evidence ({linkedEvs.length})
                              </h5>
                              {linkedEvs.length > 0 ? (
                                <div className="space-y-1">
                                  {linkedEvs.map(e => (
                                    <div key={e.id} className="p-1.5 bg-slate-50 border rounded text-[11px]">
                                      <div className="font-bold text-slate-800 truncate">{e.fileName}</div>
                                      <div className="text-[10px] text-slate-500">Uploaded by {e.uploadedBy}</div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[11px] text-slate-400 italic">No evidence files uploaded.</p>
                              )}
                              <div className="mt-3 pt-2 border-t border-slate-100 text-right">
                                <button
                                  onClick={() => router.push(`/risk/${risk.id}`)}
                                  className="text-xs font-semibold text-indigo-600 hover:underline"
                                >
                                  View full detail view →
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{Math.min((currentPage - 1) * itemsPerPage + 1, risks.length)}</span> to{' '}
            <span className="font-bold text-slate-800">{Math.min(currentPage * itemsPerPage, risks.length)}</span> of{' '}
            <span className="font-bold text-slate-800">{risks.length}</span> risks
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-semibold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Risk Modal */}
      <EditRiskModal
        risk={editingRisk}
        isOpen={!!editingRisk}
        onClose={() => setEditingRisk(null)}
      />
    </>
  );
};
