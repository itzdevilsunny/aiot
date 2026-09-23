'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RiskItem, StatusLevel } from '../../types/risk';
import { useRiskContext } from '../../context/RiskContext';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
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
  FileText
} from 'lucide-react';

interface RiskDetailProps {
  risk: RiskItem;
}

export const RiskDetail: React.FC<RiskDetailProps> = ({ risk }) => {
  const router = useRouter();
  const { updateRiskStatus, toggleChecklistItem, deleteRisk, addToast, updateRisk } = useRiskContext();

  const [isEditing, setIsEditing] = useState(false);
  const [titleInput, setTitleInput] = useState(risk.title);
  const [descInput, setDescInput] = useState(risk.description);
  const [mitigationInput, setMitigationInput] = useState(risk.mitigationPlan);
  const [contingencyInput, setContingencyInput] = useState(risk.contingencyPlan);

  const handleSaveEdits = () => {
    updateRisk(risk.id, {
      title: titleInput,
      description: descInput,
      mitigationPlan: mitigationInput,
      contingencyPlan: contingencyInput
    });
    setIsEditing(false);
  };

  const handleApplyCopilotRec = () => {
    updateRisk(risk.id, {
      probability: Math.max(1, risk.probability - 1) as any,
      mitigationProgress: Math.min(100, risk.mitigationProgress + 20)
    });
    addToast('Copilot Recommendation Applied', 'Risk probability reduced and progress updated.', 'success');
  };

  return (
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

      {/* Main Header Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
              {risk.id}
            </span>
            <Badge variant="category">{risk.category}</Badge>
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
            <Button variant="primary" size="sm" onClick={handleSaveEdits}>
              Save Title & Description
            </Button>
          </div>
        )}
      </div>

      {/* Grid Layout: Left Column (Assessment & Mitigation) / Right Column (Ownership, Timeline, Copilot) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 2: Risk Assessment & Score Gauge */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>2. Quantitative Risk Assessment</span>
            </h3>

            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Probability</span>
                <div className="text-xl font-extrabold text-indigo-950 mt-1 font-mono">{risk.probability} / 5</div>
                <span className="text-[10px] font-semibold text-slate-500">Likely occurrence</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Impact</span>
                <div className="text-xl font-extrabold text-amber-950 mt-1 font-mono">{risk.impact} / 5</div>
                <span className="text-[10px] font-semibold text-slate-500">Severity magnitude</span>
              </div>

              <div className="border-l border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Risk Score</span>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <span className="text-2xl font-mono font-extrabold text-slate-900">{risk.score}</span>
                  <Badge severity={risk.severity} />
                </div>
                <span className="text-[10px] font-semibold text-slate-500">1 to 25 scale</span>
              </div>
            </div>

            {/* Score Visual Scale Bar */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
                <span>Score Scale Gauge (1-25)</span>
                <span>Current Rating: <strong className="text-slate-900 font-mono">{risk.score} / 25</strong></span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex p-0.5 border border-slate-200">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    risk.severity === 'Critical' ? 'bg-red-600' :
                    risk.severity === 'High' ? 'bg-orange-600' :
                    risk.severity === 'Medium' ? 'bg-amber-500' : 'bg-emerald-600'
                  }`} 
                  style={{ width: `${(risk.score / 25) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Proactive Mitigation Strategy */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>4. Proactive Mitigation Strategy</span>
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
            <div className="pt-2 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Execution Action Checklist ({risk.checklist.filter(c => c.completed).length} / {risk.checklist.length})
              </h4>

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

          {/* Section 5: Contingency Plan */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>5. Contingency Fallback Plan</span>
            </h3>
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
          {/* Section 3: Ownership & Backup */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-600" />
              <span>3. Ownership & Backup</span>
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
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Primary Owner</span>
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
              <span>Copilot Live Telemetry Insight</span>
            </div>
            <p className="text-xs text-indigo-950 leading-relaxed font-medium">
              Historical resolution telemetry shows that executing the current staging checklists usually reduces risk probability from <strong className="font-mono">{risk.probability}</strong> down to <strong className="font-mono">2</strong>.
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
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              <span>6. Audit Log & Timeline</span>
            </h3>

            <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {risk.activityLogs.map((log) => (
                <div key={log.id} className="relative pl-7 text-xs">
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
  );
};
