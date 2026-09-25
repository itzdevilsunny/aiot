'use client';

import React, { useState } from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { Button } from '../ui/Button';
import { ComplianceControl } from './ControlDetailModal';
import { Plus, X, Shield, Sparkles } from 'lucide-react';

interface CustomControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddControl: (newControl: ComplianceControl) => void;
}

export const CustomControlModal: React.FC<CustomControlModalProps> = ({
  isOpen,
  onClose,
  onAddControl
}) => {
  const { addToast } = useRiskContext();

  const [framework, setFramework] = useState<string>('HIPAA');
  const [controlId, setControlId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('Security');
  const [description, setDescription] = useState<string>('');
  const [mappedCategory, setMappedCategory] = useState<string>('Security');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!controlId.trim() || !name.trim() || !description.trim()) {
      addToast('Missing Required Fields', 'Please fill in Control ID, Title, and Description.', 'warning');
      return;
    }

    const newControl: ComplianceControl = {
      framework: framework as any,
      controlId: controlId.trim().toUpperCase(),
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      mappedCategories: [mappedCategory]
    };

    onAddControl(newControl);
    addToast('Custom Control Added', `Registered control ${newControl.controlId} under ${newControl.framework}.`, 'success');
    onClose();

    // Reset
    setControlId('');
    setName('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-extrabold tracking-tight">Add Custom Regulatory Control</h2>
              <p className="text-[11px] text-slate-300">Add custom policies (HIPAA, FedRAMP, Internal Policy) to matrix</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Framework</label>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="HIPAA">HIPAA Security Rule</option>
                <option value="FedRAMP">FedRAMP High</option>
                <option value="ISO 27001">ISO 27001:2022</option>
                <option value="PCI DSS 4.0">PCI DSS 4.0</option>
                <option value="Custom Policy">Custom Enterprise Policy</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Control ID</label>
              <input
                type="text"
                placeholder="e.g. HIPAA-164.312"
                value={controlId}
                onChange={(e) => setControlId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Control Title</label>
            <input
              type="text"
              placeholder="e.g. Audit Controls & Access Integrity"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Control Category</label>
              <input
                type="text"
                placeholder="e.g. Data Privacy / Access"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mapped Risk Category</label>
              <select
                value={mappedCategory}
                onChange={(e) => setMappedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Security">Security</option>
                <option value="Technical">Technical</option>
                <option value="Compliance">Compliance</option>
                <option value="Operational">Operational</option>
                <option value="Financial">Financial</option>
                <option value="Resource">Resource</option>
                <option value="Schedule">Schedule</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description & Requirements</label>
            <textarea
              rows={3}
              placeholder="Describe the regulatory requirement and compliance baseline..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" icon={<Plus className="w-3.5 h-3.5" />}>
              Add Custom Control
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
