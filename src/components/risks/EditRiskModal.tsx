'use client';

import React, { useState, useEffect } from 'react';
import { X, Sliders, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { useRiskContext } from '../../context/RiskContext';
import { RiskItem, RiskCategory, ProbabilityLevel, ImpactLevel, StatusLevel } from '../../types/risk';

interface EditRiskModalProps {
  risk: RiskItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditRiskModal: React.FC<EditRiskModalProps> = ({ risk, isOpen, onClose }) => {
  const { updateRisk, teamMembers, projects } = useRiskContext();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<RiskCategory>('Technical');
  const [probability, setProbability] = useState<ProbabilityLevel>(4);
  const [impact, setImpact] = useState<ImpactLevel>(4);
  const [status, setStatus] = useState<StatusLevel>('Open');
  const [ownerName, setOwnerName] = useState('');
  const [mitigationPlan, setMitigationPlan] = useState('');
  const [contingencyPlan, setContingencyPlan] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (risk) {
      setTitle(risk.title);
      setDescription(risk.description);
      setCategory(risk.category);
      setProbability(risk.probability);
      setImpact(risk.impact);
      setStatus(risk.status);
      setOwnerName(risk.ownerName);
      setMitigationPlan(risk.mitigationPlan);
      setContingencyPlan(risk.contingencyPlan);
      setDueDate(risk.dueDate || '');
    }
  }, [risk]);

  if (!isOpen || !risk) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ownerObj = teamMembers.find(m => m.name === ownerName) || teamMembers[0];

    updateRisk(risk.id, {
      title,
      description,
      category,
      probability,
      impact,
      status,
      ownerId: ownerObj.id,
      ownerName: ownerObj.name,
      ownerRole: ownerObj.role,
      ownerAvatar: ownerObj.avatar,
      mitigationPlan,
      contingencyPlan,
      dueDate
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in-50">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Edit Risk Record ({risk.id})</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Risk Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              >
                {['Technical', 'Resource', 'Financial', 'Schedule', 'Operational', 'Security', 'Compliance', 'External'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Probability (1-5)</label>
              <select
                value={probability}
                onChange={(e) => setProbability(Number(e.target.value) as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-indigo-600 focus:outline-none font-mono"
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Impact (1-5)</label>
              <select
                value={impact}
                onChange={(e) => setImpact(Number(e.target.value) as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-indigo-600 focus:outline-none font-mono"
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Assigned Owner</label>
              <select
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              >
                {teamMembers.map(m => (
                  <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              >
                <option value="Open">Open</option>
                <option value="Monitoring">Monitoring</option>
                <option value="Mitigated">Mitigated</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Proactive Mitigation Plan</label>
            <textarea
              rows={2}
              value={mitigationPlan}
              onChange={(e) => setMitigationPlan(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Contingency Fallback Plan</label>
            <textarea
              rows={2}
              value={contingencyPlan}
              onChange={(e) => setContingencyPlan(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={<Save className="w-3.5 h-3.5" />}>
              Save Risk Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
