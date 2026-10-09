'use client';

import React, { useState } from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  Trash2, 
  FileText
} from 'lucide-react';

export default function ActionsPage() {
  const { actions, risks, controls, addAction, updateAction, deleteAction, currentUser } = useRiskContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [riskId, setRiskId] = useState(risks[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [linkedControlId, setLinkedControlId] = useState('');
  const [assignedOwnerName, setAssignedOwnerName] = useState(currentUser.name);
  const [assignedOwnerRole, setAssignedOwnerRole] = useState(currentUser.role);
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [dueDate, setDueDate] = useState('');

  const now = new Date();

  const filteredActions = actions.filter(act => {
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const mTitle = act.title.toLowerCase().includes(q);
      const mDesc = act.description.toLowerCase().includes(q);
      const mOwner = act.assignedOwnerName.toLowerCase().includes(q);
      const mRisk = (act.riskTitle || '').toLowerCase().includes(q);
      if (!mTitle && !mDesc && !mOwner && !mRisk) return false;
    }
    if (statusFilter !== 'All' && act.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && act.priority !== priorityFilter) return false;
    return true;
  });

  const handleCreateAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !riskId) return;

    const targetRisk = risks.find(r => r.id === riskId);

    addAction({
      riskId,
      riskTitle: targetRisk?.title || 'Unknown Risk',
      title,
      description,
      linkedControlId: linkedControlId || undefined,
      assignedOwnerName,
      assignedOwnerRole,
      priority,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'In Progress',
      progressPct: 10,
      verificationStatus: 'Pending Verification'
    });

    setIsModalOpen(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Mitigation Actions Tracking</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage granular mitigation tasks, due dates, action owners, and verification evidence.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Mitigation Action</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Mitigation Actions</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{actions.length}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Assigned across risk register</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">In Progress</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-600 mt-2">
            {actions.filter(a => a.status === 'In Progress').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Active work in flight</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Overdue Actions</span>
            <div className="p-2 rounded-lg bg-red-50 text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-red-600 mt-2">
            {actions.filter(a => a.status !== 'Completed' && new Date(a.dueDate) < now).length}
          </div>
          <div className="text-[11px] text-red-600 font-semibold mt-1">Past target completion date</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Verified Completed</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">
            {actions.filter(a => a.status === 'Completed').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Verified with evidence</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action by title, risk, or assignee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Blocked">Blocked</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Action Title & Linked Risk</th>
                <th className="px-4 py-3.5">Assignee</th>
                <th className="px-4 py-3.5">Priority</th>
                <th className="px-4 py-3.5">Due Date & SLA</th>
                <th className="px-4 py-3.5">Progress</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredActions.map((act) => {
                const isOverdue = act.status !== 'Completed' && new Date(act.dueDate) < now;

                return (
                  <tr key={act.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{act.title}</div>
                      <div className="text-[11px] text-indigo-600 font-mono font-semibold mt-0.5">
                        Linked Risk: {act.riskId}
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{act.assignedOwnerName}</div>
                      <div className="text-[10px] text-slate-500">{act.assignedOwnerRole}</div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        act.priority === 'High'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : act.priority === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                      }`}>
                        {act.priority}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{act.dueDate}</div>
                      {isOverdue && (
                        <div className="text-[10px] font-bold text-red-600 inline-flex items-center gap-1 mt-0.5">
                          <AlertTriangle className="w-3 h-3" /> Overdue SLA
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${act.progressPct === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                            style={{ width: `${act.progressPct}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-bold text-slate-700">{act.progressPct}%</span>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <select
                        value={act.status}
                        onChange={(e) => {
                          const newStatus = e.target.value as any;
                          const newProg = newStatus === 'Completed' ? 100 : act.progressPct;
                          updateAction(act.id, { status: newStatus, progressPct: newProg });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border focus:outline-none ${
                          act.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : act.status === 'Blocked'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Blocked">Blocked</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>

                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => deleteAction(act.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Action"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredActions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-500 text-xs">
                    No mitigation actions found. Click "New Mitigation Action" to assign a task.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-popover border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Assign Mitigation Action</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAction} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Risk</label>
                <select
                  value={riskId}
                  onChange={e => setRiskId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                >
                  {risks.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.id}: {r.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Action Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement Redis response caching TTL"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Task details and expected output..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assignee Name</label>
                  <input
                    type="text"
                    value={assignedOwnerName}
                    onChange={e => setAssignedOwnerName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Due Date</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-semibold"
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
                  Create Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
