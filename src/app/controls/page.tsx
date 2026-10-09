'use client';

import React, { useState } from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { Control } from '../../types/risk';
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Edit3, 
  Trash2,
  ExternalLink,
  Layers
} from 'lucide-react';

export default function ControlsPage() {
  const { controls, risks, addControl, updateControl, deleteControl, currentUser } = useRiskContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [effectivenessFilter, setEffectivenessFilter] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New control form state
  const [newControlName, setNewControlName] = useState('');
  const [newControlDesc, setNewControlDesc] = useState('');
  const [newControlCategory, setNewControlCategory] = useState('Operational');
  const [newControlType, setNewControlType] = useState<'Preventive' | 'Detective' | 'Corrective'>('Preventive');
  const [newControlObjective, setNewControlObjective] = useState('');
  const [newControlEffectiveness, setNewControlEffectiveness] = useState<'Effective' | 'Partially Effective' | 'Ineffective'>('Effective');
  const [newControlTestStatus, setNewControlTestStatus] = useState<'Passed' | 'Failed' | 'Pending Test'>('Passed');
  const [selectedRiskIds, setSelectedRiskIds] = useState<string[]>([]);

  const filteredControls = controls.filter(ctrl => {
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = ctrl.name.toLowerCase().includes(q);
      const matchDesc = ctrl.description.toLowerCase().includes(q);
      const matchId = ctrl.id.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchId) return false;
    }
    if (typeFilter !== 'All' && ctrl.type !== typeFilter) return false;
    if (effectivenessFilter !== 'All' && ctrl.effectiveness !== effectivenessFilter) return false;
    return true;
  });

  const handleCreateControl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newControlName.trim()) return;

    addControl({
      name: newControlName,
      description: newControlDesc,
      category: newControlCategory,
      type: newControlType,
      objective: newControlObjective,
      ownerName: currentUser.name,
      ownerRole: currentUser.role,
      implementationStatus: 'Implemented',
      effectiveness: newControlEffectiveness,
      testStatus: newControlTestStatus,
      lastTestDate: new Date().toISOString().split('T')[0],
      nextTestDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      linkedRiskIds: selectedRiskIds
    });

    setIsCreateModalOpen(false);
    setNewControlName('');
    setNewControlDesc('');
    setNewControlObjective('');
    setSelectedRiskIds([]);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Internal Controls Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Define, test, and link internal risk-mitigating controls across enterprise operations.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Control</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Active Controls</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{controls.length}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Mapped to {risks.length} active risks</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Effective Controls</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">
            {controls.filter(c => c.effectiveness === 'Effective').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Passing internal audits</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Failed Test Warnings</span>
            <div className="p-2 rounded-lg bg-red-50 text-red-600">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-red-600 mt-2">
            {controls.filter(c => c.testStatus === 'Failed').length}
          </div>
          <div className="text-[11px] text-red-600 font-semibold mt-1">Requires immediate remediation</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Tests</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 mt-2">
            {controls.filter(c => c.testStatus === 'Pending Test').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Scheduled in current cycle</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search controls by name, ID, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="All">All Types</option>
              <option value="Preventive">Preventive</option>
              <option value="Detective">Detective</option>
              <option value="Corrective">Corrective</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Effectiveness:</span>
            <select
              value={effectivenessFilter}
              onChange={(e) => setEffectivenessFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Effective">Effective</option>
              <option value="Partially Effective">Partially Effective</option>
              <option value="Ineffective">Ineffective</option>
            </select>
          </div>
        </div>
      </div>

      {/* Controls Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Control ID & Name</th>
                <th className="px-4 py-3.5">Category & Type</th>
                <th className="px-4 py-3.5">Owner</th>
                <th className="px-4 py-3.5">Effectiveness</th>
                <th className="px-4 py-3.5">Latest Test</th>
                <th className="px-4 py-3.5">Linked Risks</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredControls.map((ctrl) => {
                const linkedRisks = risks.filter(r => ctrl.linkedRiskIds?.includes(r.id));

                return (
                  <tr key={ctrl.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-2.5">
                        <span className="font-mono text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md shrink-0">
                          {ctrl.id}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900">{ctrl.name}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{ctrl.description}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{ctrl.category}</div>
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold mt-1 ${
                        ctrl.type === 'Preventive' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : ctrl.type === 'Detective'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {ctrl.type}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{ctrl.ownerName}</div>
                      <div className="text-[10px] text-slate-500">{ctrl.ownerRole}</div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                        ctrl.effectiveness === 'Effective'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ctrl.effectiveness === 'Partially Effective'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {ctrl.effectiveness === 'Effective' && <CheckCircle2 className="w-3 h-3" />}
                        {ctrl.effectiveness === 'Partially Effective' && <AlertTriangle className="w-3 h-3" />}
                        {ctrl.effectiveness === 'Ineffective' && <XCircle className="w-3 h-3" />}
                        {ctrl.effectiveness}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">
                        Status: <span className={`font-bold ${ctrl.testStatus === 'Passed' ? 'text-emerald-600' : ctrl.testStatus === 'Failed' ? 'text-red-600' : 'text-amber-600'}`}>{ctrl.testStatus}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Tested: {ctrl.lastTestDate || 'N/A'}</div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {linkedRisks.length > 0 ? (
                          linkedRisks.map((r, idx) => (
                            <span key={`${r.id}-${idx}`} className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono font-bold text-slate-700">
                              {r.id}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No linked risks</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => deleteControl(ctrl.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Control"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredControls.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-500 text-xs">
                    No matching controls found. Click "Add New Control" to define an internal safeguard.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Control Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-popover border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add New Internal Control</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateControl} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Control Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Automated Multifactor Authentication Policy"
                  value={newControlName}
                  onChange={e => setNewControlName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe the control mechanism..."
                  value={newControlDesc}
                  onChange={e => setNewControlDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newControlCategory}
                    onChange={e => setNewControlCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                  >
                    <option value="Operational">Operational</option>
                    <option value="Technical">Technical</option>
                    <option value="Security">Security</option>
                    <option value="Compliance">Compliance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Control Type</label>
                  <select
                    value={newControlType}
                    onChange={e => setNewControlType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                  >
                    <option value="Preventive">Preventive</option>
                    <option value="Detective">Detective</option>
                    <option value="Corrective">Corrective</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Control Objective</label>
                <input
                  type="text"
                  placeholder="e.g. Prevent unauthorized access to production database"
                  value={newControlObjective}
                  onChange={e => setNewControlObjective(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Effectiveness</label>
                  <select
                    value={newControlEffectiveness}
                    onChange={e => setNewControlEffectiveness(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                  >
                    <option value="Effective">Effective</option>
                    <option value="Partially Effective">Partially Effective</option>
                    <option value="Ineffective">Ineffective</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Test Status</label>
                  <select
                    value={newControlTestStatus}
                    onChange={e => setNewControlTestStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                  >
                    <option value="Passed">Passed</option>
                    <option value="Failed">Failed</option>
                    <option value="Pending Test">Pending Test</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Link to Active Risks</label>
                <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1.5">
                  {risks.map((r, idx) => (
                    <label key={`${r.id}-${idx}`} className="flex items-center gap-2 text-[11px] text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRiskIds.includes(r.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedRiskIds(prev => [...prev, r.id]);
                          else setSelectedRiskIds(prev => prev.filter(id => id !== r.id));
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="font-mono font-bold text-indigo-600">{r.id}:</span>
                      <span className="truncate">{r.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold"
                >
                  Save Control
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
