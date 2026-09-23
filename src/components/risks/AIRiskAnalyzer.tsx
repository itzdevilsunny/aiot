'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRiskContext } from '../../context/RiskContext';
import { AIRiskAnalysisResult, RiskCategory, ProbabilityLevel, ImpactLevel } from '../../types/risk';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  Sliders, 
  Bot,
  Wand2
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const AIRiskAnalyzer: React.FC = () => {
  const router = useRouter();
  const { simulateAIRiskAnalysis, addRisk, projects, teamMembers } = useRiskContext();

  const [promptText, setPromptText] = useState(
    'The backend developer may be unavailable during the final week, which could delay deployment and critical staging sign-off.'
  );

  const [analyzingStep, setAnalyzingStep] = useState<number>(0);
  const [result, setResult] = useState<AIRiskAnalysisResult | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Editable state when tweaking analysis
  const [editedTitle, setEditedTitle] = useState('');
  const [editedCategory, setEditedCategory] = useState<RiskCategory>('Resource');
  const [editedProb, setEditedProb] = useState<ProbabilityLevel>(4);
  const [editedImp, setEditedImp] = useState<ImpactLevel>(4);
  const [editedMitigation, setEditedMitigation] = useState('');
  const [editedContingency, setEditedContingency] = useState('');
  const [editedOwner, setEditedOwner] = useState(teamMembers[0].name);

  const samplePrompts = [
    'The backend developer may be unavailable during the final week, which could delay deployment.',
    'Database locks during flash sales might cause payment webhook timeouts and missing orders.',
    'Uncapped Kubernetes node autoscaling in staging might cause cloud budget overruns.',
    'Third-party auth library zero-day vulnerability could compromise user sessions.'
  ];

  const handleRunAnalysis = async () => {
    if (!promptText.trim()) return;

    setResult(null);
    setIsEditing(false);
    setAnalyzingStep(1); // 1: Analyzing description

    await new Promise(r => setTimeout(r, 600));
    setAnalyzingStep(2); // 2: Identifying category

    await new Promise(r => setTimeout(r, 600));
    setAnalyzingStep(3); // 3: Assessing matrix

    await new Promise(r => setTimeout(r, 700));
    setAnalyzingStep(4); // 4: Generating mitigation

    const res = await simulateAIRiskAnalysis(promptText);
    setResult(res);

    // Populate editable fields
    setEditedTitle(res.title);
    setEditedCategory(res.category);
    setEditedProb(res.probability);
    setEditedImp(res.impact);
    setEditedMitigation(res.mitigationPlan);
    setEditedContingency(res.contingencyPlan);
    setEditedOwner(res.suggestedOwnerName);

    setAnalyzingStep(0);
  };

  const handleSaveToRegister = () => {
    if (!result) return;

    const ownerObj = teamMembers.find(m => m.name === editedOwner) || teamMembers[0];
    const projectObj = projects[0];

    const newRisk = addRisk({
      title: editedTitle,
      description: promptText,
      category: editedCategory,
      probability: editedProb,
      impact: editedImp,
      status: 'Open',
      projectId: projectObj.id,
      projectName: projectObj.name,
      ownerId: ownerObj.id,
      ownerName: ownerObj.name,
      ownerRole: ownerObj.role,
      ownerAvatar: ownerObj.avatar,
      mitigationPlan: editedMitigation,
      contingencyPlan: editedContingency,
      mitigationProgress: 0,
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      aiSuggested: true,
      aiConfidence: result.aiConfidence,
      estimatedImpactUsd: result.estimatedImpactUsd,
      checklist: [
        { id: 'c1', title: 'Schedule kickoff sync with assigned risk owner', completed: false },
        { id: 'c2', title: 'Document mitigation runbook and update team roadmap', completed: false }
      ],
      activityLogs: [
        {
          id: `act-${Date.now()}`,
          timestamp: 'Just now',
          author: 'AI Copilot Synthesizer',
          action: `Structured natural language threat with ${result.aiConfidence}% confidence score.`,
          type: 'ai_analysis'
        }
      ]
    });

    router.push(`/risk/${newRisk.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex items-start justify-between">
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Copilot AI Inference Engine</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight pt-1">
              AI Natural Language Risk Analyzer
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Describe a potential project threat in plain English. The Copilot will automatically analyze, quantify, categorize, and draft mitigation & contingency plans.
            </p>
          </div>

          <div className="hidden sm:block p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
            <Bot className="w-8 h-8 text-indigo-300 mx-auto" />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mt-1">Zero latency</span>
          </div>
        </div>
      </div>

      {/* Input Form Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
            Describe the Potential Risk in your own words
          </label>
          <textarea
            rows={4}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Example: Our payment gateway integration may not be completed before the release deadline because..."
            className="w-full p-4 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white text-slate-900 font-medium leading-relaxed"
          />
        </div>

        {/* Sample Prompt Pills */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Try Quick Sample Scenarios:
          </span>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => setPromptText(sample)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium transition-colors text-left max-w-xs truncate"
              >
                &ldquo;{sample}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <Button
            variant="copilot"
            size="lg"
            icon={<Wand2 className="w-4 h-4" />}
            onClick={handleRunAnalysis}
            disabled={analyzingStep > 0 || !promptText.trim()}
          >
            {analyzingStep > 0 ? 'Analyzing Risk Telemetry...' : 'Synthesize & Quantify with Copilot'}
          </Button>
        </div>
      </div>

      {/* Loading Multi-step Streaming State Indicator */}
      {analyzingStep > 0 && (
        <div className="p-6 rounded-2xl bg-white border border-indigo-100 shadow-lg space-y-3 animate-in fade-in-50">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Copilot Inference Pipeline Running...</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className={`flex items-center gap-2.5 p-2.5 rounded-lg transition-colors ${analyzingStep >= 1 ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'text-slate-400'}`}>
              {analyzingStep > 1 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />}
              <span>1. Analyzing natural language threat description...</span>
            </div>

            <div className={`flex items-center gap-2.5 p-2.5 rounded-lg transition-colors ${analyzingStep >= 2 ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'text-slate-400'}`}>
              {analyzingStep > 2 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : analyzingStep === 2 ? <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-200" />}
              <span>2. Identifying category classification & operational impact vector...</span>
            </div>

            <div className={`flex items-center gap-2.5 p-2.5 rounded-lg transition-colors ${analyzingStep >= 3 ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'text-slate-400'}`}>
              {analyzingStep > 3 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : analyzingStep === 3 ? <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-200" />}
              <span>3. Assessing Probability × Impact matrix score & assigning risk owner...</span>
            </div>

            <div className={`flex items-center gap-2.5 p-2.5 rounded-lg transition-colors ${analyzingStep >= 4 ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'text-slate-400'}`}>
              {analyzingStep === 4 ? <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-200" />}
              <span>4. Synthesizing multi-tier mitigation & contingency strategy...</span>
            </div>
          </div>
        </div>
      )}

      {/* Structured Result Display */}
      {result && analyzingStep === 0 && (
        <div className="p-6 rounded-2xl bg-white border border-indigo-200 shadow-xl space-y-5 animate-in slide-in-from-bottom-4">
          {/* AI Banner Label */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs">
            <div className="flex items-center gap-2 text-indigo-900 font-bold">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>✨ AI-generated suggestion — review before saving.</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-200 text-indigo-800">
              Confidence: {result.aiConfidence}%
            </span>
          </div>

          {!isEditing ? (
            /* Structured Output View */
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Synthesized Risk Title</span>
                <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">{editedTitle}</h2>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Category</span>
                  <div className="mt-1">
                    <Badge variant="category">{editedCategory}</Badge>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Matrix Score</span>
                  <div className="mt-1 flex items-center gap-2 font-mono font-bold text-slate-900 text-sm">
                    <span>{editedProb} × {editedImp} = {editedProb * editedImp}</span>
                    <Badge severity={result.severity} />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Suggested Owner</span>
                  <div className="mt-1 text-xs font-bold text-slate-900">
                    {editedOwner}
                  </div>
                </div>
              </div>

              {/* Mitigation & Contingency */}
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
                  <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Proactive Mitigation Plan
                  </h4>
                  <p className="text-xs text-slate-800 mt-1.5 leading-relaxed font-medium">
                    {editedMitigation}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
                  <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <span>⚡ Contingency Fallback Plan</span>
                  </h4>
                  <p className="text-xs text-slate-800 mt-1.5 leading-relaxed font-medium">
                    {editedContingency}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Sliders className="w-3.5 h-3.5" />}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Structured Analysis
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  icon={<ArrowRight className="w-4 h-4" />}
                  onClick={handleSaveToRegister}
                >
                  Add to Risk Register
                </Button>
              </div>
            </div>
          ) : (
            /* Editing Form View */
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-slate-900">Refine AI Analysis Fields</h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={editedCategory}
                    onChange={(e) => setEditedCategory(e.target.value as RiskCategory)}
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300 font-medium"
                  >
                    {['Technical', 'Resource', 'Financial', 'Schedule', 'Operational', 'Security', 'Compliance', 'External'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Probability (1-5)</label>
                  <select
                    value={editedProb}
                    onChange={(e) => setEditedProb(Number(e.target.value) as ProbabilityLevel)}
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300 font-medium"
                  >
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Impact (1-5)</label>
                  <select
                    value={editedImp}
                    onChange={(e) => setEditedImp(Number(e.target.value) as ImpactLevel)}
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300 font-medium"
                  >
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Owner</label>
                <select
                  value={editedOwner}
                  onChange={(e) => setEditedOwner(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 font-medium"
                >
                  {teamMembers.map(m => (
                    <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mitigation Plan</label>
                <textarea
                  rows={2}
                  value={editedMitigation}
                  onChange={(e) => setEditedMitigation(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contingency Plan</label>
                <textarea
                  rows={2}
                  value={editedContingency}
                  onChange={(e) => setEditedContingency(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={() => setIsEditing(false)}>
                  Save Field Changes
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
