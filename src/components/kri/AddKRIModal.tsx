'use client';

import React, { useState } from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { Button } from '../ui/Button';
import { KRIItem } from '../analytics/KRIMonitoring';
import { Plus, X, Gauge, Sparkles } from 'lucide-react';

interface AddKRIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddKRI: (newKri: KRIItem) => void;
}

export const AddKRIModal: React.FC<AddKRIModalProps> = ({
  isOpen,
  onClose,
  onAddKRI
}) => {
  const { risks, addToast } = useRiskContext();

  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('Technical');
  const [currentValue, setCurrentValue] = useState<number>(10);
  const [unit, setUnit] = useState<string>('%');
  const [targetThreshold, setTargetThreshold] = useState<number>(50);
  const [criticalThreshold, setCriticalThreshold] = useState<number>(80);
  const [linkedRiskId, setLinkedRiskId] = useState<string>(risks[0]?.id || 'RSK-101');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      addToast('Missing Metric Name', 'Please specify a name for the Key Risk Indicator.', 'warning');
      return;
    }

    const newKri: KRIItem = {
      id: `KRI-${Math.floor(100 + Math.random() * 900)}`,
      name: name.trim(),
      category,
      currentValue: Number(currentValue),
      unit: unit.trim(),
      targetThreshold: Number(targetThreshold),
      criticalThreshold: Number(criticalThreshold),
      status: Number(currentValue) >= Number(criticalThreshold) ? 'Breached' : Number(currentValue) >= Number(targetThreshold) ? 'Warning' : 'Normal',
      linkedRiskId,
      lastUpdated: 'Just now'
    };

    onAddKRI(newKri);
    addToast('KRI Metric Added', `Registered indicator ${newKri.id} (${newKri.name}).`, 'success');
    onClose();

    // Reset
    setName('');
    setCurrentValue(10);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <Gauge className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-extrabold tracking-tight">Add Key Risk Indicator (KRI)</h2>
              <p className="text-[11px] text-slate-300">Set SLA thresholds and link to operational risk register items</p>
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
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Metric Title</label>
            <input
              type="text"
              placeholder="e.g. Cloudflare Rate-Limiting Block Rate"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Technical">Technical</option>
                <option value="Security">Security</option>
                <option value="Financial">Financial</option>
                <option value="Operational">Operational</option>
                <option value="Resource">Resource</option>
                <option value="Compliance">Compliance</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Linked Risk Item</label>
              <select
                value={linkedRiskId}
                onChange={(e) => setLinkedRiskId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {risks.map(r => (
                  <option key={r.id} value={r.id}>{r.id} - {r.title.slice(0, 25)}...</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Live Initial Value</label>
              <input
                type="number"
                step="any"
                value={currentValue}
                onChange={(e) => setCurrentValue(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Unit of Measure</label>
              <input
                type="text"
                placeholder="e.g. %, ms, req/sec, $"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-amber-700 uppercase mb-1">Warning Threshold Limit</label>
              <input
                type="number"
                step="any"
                value={targetThreshold}
                onChange={(e) => setTargetThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 bg-amber-50/50 border border-amber-200 rounded-lg font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-red-700 uppercase mb-1">Critical Breach Limit</label>
              <input
                type="number"
                step="any"
                value={criticalThreshold}
                onChange={(e) => setCriticalThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 bg-red-50/50 border border-red-200 rounded-lg font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" icon={<Plus className="w-3.5 h-3.5" />}>
              Add KRI Metric
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
