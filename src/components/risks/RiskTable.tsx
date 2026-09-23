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
  Edit2
} from 'lucide-react';

interface RiskTableProps {
  risks: RiskItem[];
}

export const RiskTable: React.FC<RiskTableProps> = ({ risks }) => {
  const router = useRouter();
  const { updateRiskStatus, deleteRisk } = useRiskContext();
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
            className={`w-2.5 h-1.5 rounded-xs transition-colors ${
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
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">ID</th>
                <th className="py-3 px-4">Risk Item & Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">P × I Matrix</th>
                <th className="py-3 px-4 text-center">Score</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedRisks.map((risk) => {
                const isExpanded = expandedId === risk.id;

                return (
                  <React.Fragment key={risk.id}>
                    <tr className={`hover:bg-slate-50/80 transition-colors ${isExpanded ? 'bg-slate-50/60' : ''}`}>
                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500 text-center">
                        <button
                          onClick={() => toggleExpand(risk.id)}
                          className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                          title="Toggle Details"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </td>

                      {/* Risk Title */}
                      <td className="py-3.5 px-4 max-w-md">
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
                              {risk.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge variant="category">{risk.category}</Badge>
                      </td>

                      {/* P x I */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-slate-500 w-8">P ({risk.probability}):</span>
                            {renderLevelBars(risk.probability, 'bg-indigo-600')}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-slate-500 w-8">I ({risk.impact}):</span>
                            {renderLevelBars(risk.impact, 'bg-amber-500')}
                          </div>
                        </div>
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex flex-col items-center">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold text-white shadow-2xs ${
                            risk.severity === 'Critical' ? 'bg-red-600' :
                            risk.severity === 'High' ? 'bg-orange-600' :
                            risk.severity === 'Medium' ? 'bg-amber-600' : 'bg-emerald-600'
                          }`}>
                            {risk.score}
                          </span>
                          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-tight mt-0.5">
                            {risk.severity}
                          </span>
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

                      {/* Inline Status Selector */}
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
                        <td colSpan={8} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            {/* Mitigation & Contingency */}
                            <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200">
                              <div>
                                <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Proactive Mitigation Strategy
                                </h5>
                                <p className="text-slate-600 mt-1 leading-relaxed">{risk.mitigationPlan}</p>
                              </div>
                              <div className="pt-2 border-t border-slate-100">
                                <h5 className="font-bold text-slate-800">Contingency Fallback:</h5>
                                <p className="text-slate-600 mt-0.5">{risk.contingencyPlan}</p>
                              </div>
                            </div>

                            {/* Action Items Checklist */}
                            <div className="bg-white p-3 rounded-xl border border-slate-200">
                              <h5 className="font-bold text-slate-900 mb-2">Mitigation Action Items ({risk.checklist.filter(c => c.completed).length}/{risk.checklist.length})</h5>
                              {risk.checklist.length > 0 ? (
                                <div className="space-y-1.5">
                                  {risk.checklist.map(item => (
                                    <div key={item.id} className="flex items-center gap-2 text-slate-700">
                                      <input
                                        type="checkbox"
                                        checked={item.completed}
                                        readOnly
                                        className="rounded text-indigo-600 focus:ring-indigo-500"
                                      />
                                      <span className={item.completed ? 'line-through text-slate-400' : ''}>
                                        {item.title}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-slate-400 italic">No checklist items defined yet.</p>
                              )}
                              <div className="mt-3 pt-2 border-t border-slate-100 text-right">
                                <button
                                  onClick={() => router.push(`/risk/${risk.id}`)}
                                  className="text-xs font-semibold text-indigo-600 hover:underline"
                                >
                                  View full detail view & timeline →
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
