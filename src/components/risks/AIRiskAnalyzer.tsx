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
  Wand2,
  Plus,
  Zap,
  FileText
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const AIRiskAnalyzer: React.FC = () => {
  const router = useRouter();
  const { simulateAIRiskAnalysis, addRisk, projects, teamMembers, addToast } = useRiskContext();

  const [activeTab, setActiveTab] = useState<'single_ai' | 'bulk_ai' | 'manual'>('single_ai');

  // Single AI Threat state
  const [promptText, setPromptText] = useState(
    'The backend developer may be unavailable during the final week, which could delay deployment and critical staging sign-off.'
  );
  const [analyzingStep, setAnalyzingStep] = useState<number>(0);
  const [result, setResult] = useState<AIRiskAnalysisResult | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Editable fields for Single AI
  const [editedTitle, setEditedTitle] = useState('');
  const [editedCategory, setEditedCategory] = useState<RiskCategory>('Resource');
  const [editedProb, setEditedProb] = useState<ProbabilityLevel>(4);
  const [editedImp, setEditedImp] = useState<ImpactLevel>(4);
  const [editedMitigation, setEditedMitigation] = useState('');
  const [editedContingency, setEditedContingency] = useState('');
  const [editedOwner, setEditedOwner] = useState(teamMembers[0].name);

  // Bulk AI state
  const [bulkTopic, setBulkTopic] = useState('Cloud Infrastructure Revamp & Database Migration');
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || 'proj-1');
  const [isGeneratingBulk, setIsGeneratingBulk] = useState(false);
  const [generatedBulkRisks, setGeneratedBulkRisks] = useState<AIRiskAnalysisResult[]>([]);

  // Manual Form State
  const [manualTitle, setManualTitle] = useState('');
  const [manualDesc, setManualDesc] = useState('');
  const [manualCategory, setManualCategory] = useState<RiskCategory>('Technical');
  const [manualProb, setManualProb] = useState<ProbabilityLevel>(3);
  const [manualImp, setManualImp] = useState<ImpactLevel>(4);
  const [manualOwner, setManualOwner] = useState(teamMembers[0].name);
  const [manualMitigation, setManualMitigation] = useState('');
  const [manualContingency, setManualContingency] = useState('');
  const [manualDueDate, setManualDueDate] = useState('');

  const samplePrompts = [
    'The backend developer may be unavailable during the final week, which could delay deployment.',
    'Database locks during flash sales might cause payment webhook timeouts and missing orders.',
    'Uncapped Kubernetes node autoscaling in staging might cause cloud budget overruns.',
    'Third-party auth library zero-day vulnerability could compromise user sessions.'
  ];

  const handleRunSingleAnalysis = async () => {
    if (!promptText.trim()) return;

    setResult(null);
    setIsEditing(false);
    setAnalyzingStep(1);

    await new Promise(r => setTimeout(r, 400));
    setAnalyzingStep(2);

    await new Promise(r => setTimeout(r, 400));
    setAnalyzingStep(3);

    const res = await simulateAIRiskAnalysis(promptText);
    setResult(res);

    setEditedTitle(res.title);
    setEditedCategory(res.category);
    setEditedProb(res.probability);
    setEditedImp(res.impact);
    setEditedMitigation(res.mitigationPlan);
    setEditedContingency(res.contingencyPlan);
    setEditedOwner(res.suggestedOwnerName);

    setAnalyzingStep(0);
  };

  const handleSaveSingleToRegister = () => {
    if (!result) return;

    const ownerObj = teamMembers.find(m => m.name === editedOwner) || teamMembers[0];
    const projectObj = projects.find(p => p.id === selectedProjectId) || projects[0];

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
        { id: 'c2', title: 'Document mitigation runbook and update roadmap', completed: false }
      ],
      activityLogs: [
        {
          id: `act-${Date.now()}`,
          timestamp: 'Just now',
          author: 'Gemini 2.5 Flash AI',
          action: `Structured natural language threat with ${result.aiConfidence}% confidence score.`,
          type: 'ai_analysis'
        }
      ]
    });

    router.push(`/risk/${newRisk.id}`);
  };

  const handleRunBulkGeneration = async () => {
    if (!bulkTopic.trim()) return;

    setIsGeneratingBulk(true);
    setGeneratedBulkRisks([]);

    const projectObj = projects.find(p => p.id === selectedProjectId) || projects[0];

    try {
      const res = await fetch('/api/generate-project-risks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: bulkTopic, projectName: projectObj.name })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.risks && data.risks.length > 0) {
          setGeneratedBulkRisks(data.risks);
          addToast('Bulk Risks Generated', `Created ${data.risks.length} AI risk records for ${projectObj.name}.`, 'success');
        }
      }
    } catch (err) {
      // Fallback generator
      const fallback: AIRiskAnalysisResult[] = [
        {
          title: 'Infrastructure Capacity Lock',
          description: bulkTopic,
          category: 'Technical',
          probability: 4,
          impact: 4,
          score: 16,
          severity: 'High',
          suggestedOwnerName: 'Sunny Prasad',
          suggestedOwnerRole: 'Business Operations Intern',
          mitigationPlan: 'Provision redundant cluster capacity and enable auto-healing.',
          contingencyPlan: 'Failover to secondary region snapshot.',
          aiConfidence: 95,
          estimatedImpactUsd: 20000
        },
        {
          title: 'Resource Allocation Bottleneck',
          description: bulkTopic,
          category: 'Resource',
          probability: 3,
          impact: 4,
          score: 12,
          severity: 'High',
          suggestedOwnerName: 'Yash Raj',
          suggestedOwnerRole: 'Operations Lead',
          mitigationPlan: 'Reallocate secondary team members for sprint 5.',
          contingencyPlan: 'Scope out non-critical features.',
          aiConfidence: 92,
          estimatedImpactUsd: 15000
        }
      ];
      setGeneratedBulkRisks(fallback);
      addToast('Bulk Risks Generated', 'Synthesized 2 operational risk items.', 'info');
    } finally {
      setIsGeneratingBulk(false);
    }
  };

  const handleAddAllBulkToRegister = () => {
    const projectObj = projects.find(p => p.id === selectedProjectId) || projects[0];
    const defaultOwner = teamMembers[0];

    generatedBulkRisks.forEach((item, index) => {
      addRisk({
        title: item.title,
        description: item.description,
        category: item.category,
        probability: item.probability,
        impact: item.impact,
        status: 'Open',
        projectId: projectObj.id,
        projectName: projectObj.name,
        ownerId: defaultOwner.id,
        ownerName: item.suggestedOwnerName || defaultOwner.name,
        ownerRole: item.suggestedOwnerRole || defaultOwner.role,
        ownerAvatar: defaultOwner.avatar,
        mitigationPlan: item.mitigationPlan,
        contingencyPlan: item.contingencyPlan,
        mitigationProgress: 0,
        dueDate: new Date(Date.now() + (10 + index * 3) * 86400000).toISOString().split('T')[0],
        aiSuggested: true,
        aiConfidence: item.aiConfidence,
        estimatedImpactUsd: item.estimatedImpactUsd,
        checklist: [
          { id: `c-${Date.now()}-${index}`, title: 'Initial risk discovery review', completed: false }
        ],
        activityLogs: [
          {
            id: `act-${Date.now()}-${index}`,
            timestamp: 'Just now',
            author: 'Gemini Bulk AI',
            action: 'Bulk risk item generated for project.',
            type: 'ai_analysis'
          }
        ]
      });
    });

    router.push('/register');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    const ownerObj = teamMembers.find(m => m.name === manualOwner) || teamMembers[0];
    const projectObj = projects.find(p => p.id === selectedProjectId) || projects[0];

    const newRisk = addRisk({
      title: manualTitle,
      description: manualDesc || manualTitle,
      category: manualCategory,
      probability: manualProb,
      impact: manualImp,
      status: 'Open',
      projectId: projectObj.id,
      projectName: projectObj.name,
      ownerId: ownerObj.id,
      ownerName: ownerObj.name,
      ownerRole: ownerObj.role,
      ownerAvatar: ownerObj.avatar,
      mitigationPlan: manualMitigation || 'Perform initial mitigation assessment.',
      contingencyPlan: manualContingency || 'Maintain contingency backup window.',
      mitigationProgress: 0,
      dueDate: manualDueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      checklist: [],
      activityLogs: [
        {
          id: `act-${Date.now()}`,
          timestamp: 'Just now',
          author: 'Sunny Prasad',
          action: 'Manually created risk entry.',
          type: 'creation'
        }
      ]
    });

    router.push(`/risk/${newRisk.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex items-start justify-between">
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Gemini 2.5 Flash AI Engine</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight pt-1">
              Add Risk & AI Threat Analyzer
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              MNB Research · Convert natural language threats into structured risk registers or generate project risk profiles.
            </p>
          </div>

          <div className="hidden sm:block p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
            <Bot className="w-8 h-8 text-indigo-300 mx-auto" />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mt-1">Live Connected</span>
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-200/70 text-xs font-bold">
        <button
          onClick={() => setActiveTab('single_ai')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'single_ai' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wand2 className="w-4 h-4 text-indigo-600" />
          <span>✨ Single Threat AI Analysis</span>
        </button>

        <button
          onClick={() => setActiveTab('bulk_ai')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'bulk_ai' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-600" />
          <span>⚡ Bulk AI Project Generator</span>
        </button>

        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'manual' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-slate-600" />
          <span>✍️ Manual Entry Form</span>
        </button>
      </div>

      {/* TAB 1: SINGLE THREAT AI ANALYSIS */}
      {activeTab === 'single_ai' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Describe the Potential Risk in your own words
              </label>
              <textarea
                rows={4}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Example: The payment gateway integration may not be completed before the release deadline, which could delay launch."
                className="w-full p-4 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white text-slate-900 font-medium leading-relaxed"
              />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Quick Sample Scenarios:
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

            <div className="pt-2 flex justify-end">
              <Button
                variant="copilot"
                size="lg"
                icon={<Wand2 className="w-4 h-4" />}
                onClick={handleRunSingleAnalysis}
                disabled={analyzingStep > 0 || !promptText.trim()}
              >
                {analyzingStep > 0 ? 'Analyzing with Gemini API...' : 'Synthesize & Quantify with Copilot'}
              </Button>
            </div>
          </div>

          {/* Structured Result Display */}
          {result && analyzingStep === 0 && (
            <div className="p-6 rounded-2xl bg-white border border-indigo-200 shadow-xl space-y-5 animate-in slide-in-from-bottom-4">
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
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Synthesized Title</span>
                    <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">{editedTitle}</h2>
                  </div>

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

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Sliders className="w-3.5 h-3.5" />}
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Analysis
                    </Button>

                    <Button
                      variant="primary"
                      size="md"
                      icon={<ArrowRight className="w-4 h-4" />}
                      onClick={handleSaveSingleToRegister}
                    >
                      Add to Risk Register
                    </Button>
                  </div>
                </div>
              ) : (
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
                        className="w-full p-2.5 text-xs rounded-lg border border-slate-300 font-medium font-mono"
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
                        className="w-full p-2.5 text-xs rounded-lg border border-slate-300 font-medium font-mono"
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
      )}

      {/* TAB 2: BULK AI PROJECT GENERATOR */}
      {activeTab === 'bulk_ai' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-slate-900">✨ Gemini AI Project Risk Profile Generator</h3>
            <p className="text-xs text-slate-500">Provide a project scope topic and let Gemini generate 3 to 4 structured operational risks automatically.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Target Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-xs"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Project Scope / Topic</label>
                <input
                  type="text"
                  value={bulkTopic}
                  onChange={(e) => setBulkTopic(e.target.value)}
                  placeholder="e.g. AWS Multi-region migration & Kubernetes hardening"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="copilot"
                size="md"
                icon={<Zap className="w-4 h-4 text-amber-300" />}
                onClick={handleRunBulkGeneration}
                disabled={isGeneratingBulk || !bulkTopic.trim()}
              >
                {isGeneratingBulk ? 'Generating Project Risks with Gemini...' : 'Generate 3-4 Project Risks'}
              </Button>
            </div>
          </div>

          {/* Generated Bulk Results Stream */}
          {generatedBulkRisks.length > 0 && (
            <div className="p-6 rounded-2xl bg-white border border-amber-200 shadow-xl space-y-4 animate-in slide-in-from-bottom-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">Generated ({generatedBulkRisks.length}) Risk Profiles</h4>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-3.5 h-3.5" />}
                  onClick={handleAddAllBulkToRegister}
                >
                  Add All to Risk Register
                </Button>
              </div>

              <div className="space-y-3">
                {generatedBulkRisks.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-slate-900">{item.title}</h5>
                      <div className="flex items-center gap-2">
                        <Badge variant="category">{item.category}</Badge>
                        <Badge severity={item.severity} />
                      </div>
                    </div>
                    <p className="text-slate-600 leading-relaxed font-medium">Mitigation: {item.mitigationPlan}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MANUAL ENTRY FORM */}
      {activeTab === 'manual' && (
        <form onSubmit={handleManualSubmit} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900">✍️ Manual Risk Entry Form</h3>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Risk Title *</label>
            <input
              type="text"
              required
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              placeholder="e.g. Third-party vendor API rate limiting during flash sale"
              className="w-full p-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Risk Description</label>
            <textarea
              rows={3}
              value={manualDesc}
              onChange={(e) => setManualDesc(e.target.value)}
              placeholder="Detailed context regarding operational threat..."
              className="w-full p-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Category</label>
              <select
                value={manualCategory}
                onChange={(e) => setManualCategory(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
              >
                {['Technical', 'Resource', 'Financial', 'Schedule', 'Operational', 'Security', 'Compliance', 'External'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Probability (1-5)</label>
              <select
                value={manualProb}
                onChange={(e) => setManualProb(Number(e.target.value) as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-medium font-mono"
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Impact (1-5)</label>
              <select
                value={manualImp}
                onChange={(e) => setManualImp(Number(e.target.value) as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-medium font-mono"
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Assigned Owner</label>
              <select
                value={manualOwner}
                onChange={(e) => setManualOwner(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
              >
                {teamMembers.map(m => (
                  <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Due Date</label>
              <input
                type="date"
                value={manualDueDate}
                onChange={(e) => setManualDueDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Proactive Mitigation Plan</label>
            <textarea
              rows={2}
              value={manualMitigation}
              onChange={(e) => setManualMitigation(e.target.value)}
              placeholder="Outline steps to reduce probability or impact..."
              className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Contingency Fallback Plan</label>
            <textarea
              rows={2}
              value={manualContingency}
              onChange={(e) => setManualContingency(e.target.value)}
              placeholder="Action plan if risk event triggers..."
              className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => router.push('/register')}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
              Create Risk Entry
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
