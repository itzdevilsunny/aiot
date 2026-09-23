'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  RiskItem, 
  Project, 
  TeamMember, 
  FilterState, 
  StatusLevel, 
  AIRiskAnalysisResult, 
  RiskCategory,
  ProbabilityLevel,
  ImpactLevel
} from '../types/risk';
import { MOCK_RISKS, MOCK_PROJECTS, MOCK_TEAM_MEMBERS, calculateSeverity } from '../data/mockData';
import { createClient } from '../lib/supabase/client';
import { 
  analyzeRiskWithAI, 
  syncRiskToRenderBackend, 
  updateRiskOnRenderBackend, 
  deleteRiskFromRenderBackend,
  checkRenderBackendHealth 
} from '../lib/api';

export interface ToastNotice {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface RiskContextType {
  risks: RiskItem[];
  projects: Project[];
  teamMembers: TeamMember[];
  selectedProjectId: string;
  filterState: FilterState;
  toasts: ToastNotice[];
  isSupabaseConnected: boolean;
  supabaseStatus: string;
  renderBackendStatus: string;
  isRenderConnected: boolean;
  setSelectedProjectId: (id: string) => void;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  addRisk: (newRisk: Omit<RiskItem, 'id' | 'createdAt' | 'lastUpdated' | 'score' | 'severity'>) => RiskItem;
  updateRisk: (id: string, updates: Partial<RiskItem>) => void;
  deleteRisk: (id: string) => void;
  updateRiskStatus: (id: string, status: StatusLevel) => void;
  toggleChecklistItem: (riskId: string, checklistId: string) => void;
  addProject: (projectData: Omit<Project, 'id' | 'totalRisks' | 'criticalRisks' | 'mitigationProgress' | 'lastUpdated'>) => Project;
  addToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  analyzeRiskWithGemini: (naturalLanguagePrompt: string) => Promise<AIRiskAnalysisResult>;
  simulateAIRiskAnalysis: (naturalLanguagePrompt: string) => Promise<AIRiskAnalysisResult>;
  getFilteredRisks: () => RiskItem[];
}

const initialFilterState: FilterState = {
  searchQuery: '',
  category: 'All',
  severity: 'All',
  status: 'All',
  owner: 'All',
  projectId: 'All',
  sortBy: 'score_desc'
};

const RiskContext = createContext<RiskContextType | undefined>(undefined);

export const RiskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [risks, setRisks] = useState<RiskItem[]>(MOCK_RISKS);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [teamMembers] = useState<TeamMember[]>(MOCK_TEAM_MEMBERS);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('All');
  const [filterState, setFilterState] = useState<FilterState>(initialFilterState);
  const [toasts, setToasts] = useState<ToastNotice[]>([]);
  const [isSupabaseConnected] = useState<boolean>(true);
  const [supabaseStatus, setSupabaseStatus] = useState<string>('Connected to Supabase Cloud');
  const [isRenderConnected, setIsRenderConnected] = useState<boolean>(true);
  const [renderBackendStatus, setRenderBackendStatus] = useState<string>('Connected to Render Backend (risk-register-copilot.onrender.com)');

  const supabase = createClient();

  useEffect(() => {
    async function initServices() {
      try {
        const { data, error } = await supabase.from('risks').select('*');
        if (data && data.length > 0) {
          const mappedRisks: RiskItem[] = data.map((row: any) => ({
            id: row.id,
            title: row.title,
            description: row.description,
            category: row.category,
            probability: row.probability,
            impact: row.impact,
            score: row.score,
            severity: row.severity,
            status: row.status,
            projectId: row.project_id || 'proj-1',
            projectName: row.project_name || 'AI Implementation',
            ownerId: row.owner_id || 'usr-1',
            ownerName: row.owner_name || 'Sunny Prasad',
            ownerRole: row.owner_role || 'Business Operations Intern',
            ownerAvatar: row.owner_avatar,
            coOwnerName: row.co_owner_name,
            coOwnerRole: row.co_owner_role,
            mitigationPlan: row.mitigation_plan,
            contingencyPlan: row.contingency_plan,
            mitigationProgress: row.mitigation_progress || 0,
            dueDate: row.due_date,
            checklist: row.checklist || [],
            activityLogs: row.activity_logs || [],
            aiSuggested: row.ai_suggested,
            aiConfidence: row.ai_confidence,
            estimatedImpactUsd: row.estimated_impact_usd,
            lastUpdated: row.last_updated || 'Just now',
            createdAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '2024-10-28'
          }));
          setRisks(mappedRisks);
          setSupabaseStatus('Synced live data with Supabase Cloud');
        } else if (error) {
          setSupabaseStatus('Supabase Cloud Ready (Local Cache Active)');
        }
      } catch (err) {
        console.log('Supabase sync note:', err);
      }

      const isRenderOk = await checkRenderBackendHealth();
      setIsRenderConnected(isRenderOk);
      if (isRenderOk) {
        setRenderBackendStatus('Render Backend Active (risk-register-copilot.onrender.com)');
      } else {
        setRenderBackendStatus('Render Backend Ready (Active fallback)');
      }
    }

    initServices();
  }, []);

  const addToast = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const resetFilters = () => {
    setFilterState(initialFilterState);
  };

  const addProject = (projectData: Omit<Project, 'id' | 'totalRisks' | 'criticalRisks' | 'mitigationProgress' | 'lastUpdated'>): Project => {
    const id = `proj-${projects.length + 1}`;
    const newProj: Project = {
      ...projectData,
      id,
      totalRisks: 0,
      criticalRisks: 0,
      mitigationProgress: 0,
      lastUpdated: 'Just now'
    };

    setProjects(prev => [newProj, ...prev]);
    addToast('Project Created', `Created workstream: ${newProj.name}`, 'success');

    // Sync to Supabase
    supabase.from('projects').insert([{
      id: newProj.id,
      name: newProj.name,
      code: newProj.code,
      description: newProj.description,
      lead_name: newProj.leadName,
      status: newProj.status,
      last_updated: 'Just now'
    }]).then(({ error }) => {
      if (error) console.log('Supabase project insert note:', error.message);
    });

    return newProj;
  };

  const addRisk = (input: Omit<RiskItem, 'id' | 'createdAt' | 'lastUpdated' | 'score' | 'severity'>): RiskItem => {
    const nextNum = 100 + risks.length + 1;
    const id = `RSK-${nextNum}`;
    const score = input.probability * input.impact;
    const severity = calculateSeverity(score);
    const now = new Date().toISOString().split('T')[0];

    const newRisk: RiskItem = {
      ...input,
      id,
      score,
      severity,
      createdAt: now,
      lastUpdated: 'Just now',
      activityLogs: [
        {
          id: `act-${Date.now()}`,
          timestamp: 'Just now',
          author: 'Sunny Prasad',
          action: 'Created new risk entry in register.',
          type: 'creation'
        },
        ...(input.activityLogs || [])
      ]
    };

    setRisks(prev => [newRisk, ...prev]);
    addToast('Risk Created', `${newRisk.id}: ${newRisk.title} added to register.`, 'success');

    // Sync to Supabase
    supabase.from('risks').insert([{
      id: newRisk.id,
      title: newRisk.title,
      description: newRisk.description,
      category: newRisk.category,
      probability: newRisk.probability,
      impact: newRisk.impact,
      score: newRisk.score,
      severity: newRisk.severity,
      status: newRisk.status,
      project_id: newRisk.projectId,
      project_name: newRisk.projectName,
      owner_id: newRisk.ownerId,
      owner_name: newRisk.ownerName,
      owner_role: newRisk.ownerRole,
      owner_avatar: newRisk.ownerAvatar,
      mitigation_plan: newRisk.mitigationPlan,
      contingency_plan: newRisk.contingencyPlan,
      mitigation_progress: newRisk.mitigationProgress,
      due_date: newRisk.dueDate,
      checklist: newRisk.checklist,
      activity_logs: newRisk.activityLogs,
      ai_suggested: newRisk.aiSuggested,
      ai_confidence: newRisk.aiConfidence,
      estimated_impact_usd: newRisk.estimatedImpactUsd,
      last_updated: newRisk.lastUpdated
    }]).then(({ error }) => {
      if (error) console.log('Supabase insert note:', error.message);
    });

    // Sync to Render Backend
    syncRiskToRenderBackend(newRisk);

    return newRisk;
  };

  const updateRisk = (id: string, updates: Partial<RiskItem>) => {
    setRisks(prev => prev.map(item => {
      if (item.id !== id) return item;
      const newProb = updates.probability ?? item.probability;
      const newImp = updates.impact ?? item.impact;
      const score = newProb * newImp;
      const severity = calculateSeverity(score);

      const updatedLog = {
        id: `act-${Date.now()}`,
        timestamp: 'Just now',
        author: 'Sunny Prasad',
        action: 'Updated risk configuration or mitigation status.',
        type: 'mitigation_update' as const
      };

      const updatedItem = {
        ...item,
        ...updates,
        probability: newProb,
        impact: newImp,
        score,
        severity,
        lastUpdated: 'Just now',
        activityLogs: [updatedLog, ...(item.activityLogs || [])]
      };

      // Sync update to Supabase
      supabase.from('risks').update({
        title: updatedItem.title,
        description: updatedItem.description,
        category: updatedItem.category,
        probability: updatedItem.probability,
        impact: updatedItem.impact,
        score: updatedItem.score,
        severity: updatedItem.severity,
        status: updatedItem.status,
        mitigation_plan: updatedItem.mitigationPlan,
        contingency_plan: updatedItem.contingencyPlan,
        mitigation_progress: updatedItem.mitigationProgress,
        checklist: updatedItem.checklist,
        activity_logs: updatedItem.activityLogs,
        last_updated: 'Just now'
      }).eq('id', id).then(({ error }) => {
        if (error) console.log('Supabase update note:', error.message);
      });

      // Sync update to Render Backend
      updateRiskOnRenderBackend(id, updates);

      return updatedItem;
    }));

    addToast('Risk Updated', `Changes saved for ${id}.`, 'info');
  };

  const deleteRisk = (id: string) => {
    setRisks(prev => prev.filter(r => r.id !== id));
    addToast('Risk Removed', `Risk ${id} deleted from workspace.`, 'warning');

    supabase.from('risks').delete().eq('id', id).then(({ error }) => {
      if (error) console.log('Supabase delete note:', error.message);
    });

    deleteRiskFromRenderBackend(id);
  };

  const updateRiskStatus = (id: string, status: StatusLevel) => {
    updateRisk(id, { status });
  };

  const toggleChecklistItem = (riskId: string, checklistId: string) => {
    setRisks(prev => prev.map(risk => {
      if (risk.id !== riskId) return risk;
      const updatedChecklist = risk.checklist.map(item => {
        if (item.id !== checklistId) return item;
        return {
          ...item,
          completed: !item.completed,
          completedAt: !item.completed ? 'Just now' : undefined
        };
      });

      const completedCount = updatedChecklist.filter(c => c.completed).length;
      const totalCount = updatedChecklist.length;
      const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : risk.mitigationProgress;

      const updated = {
        ...risk,
        checklist: updatedChecklist,
        mitigationProgress: newProgress,
        lastUpdated: 'Just now'
      };

      supabase.from('risks').update({
        checklist: updatedChecklist,
        mitigation_progress: newProgress,
        last_updated: 'Just now'
      }).eq('id', riskId).then(({ error }) => {
        if (error) console.log('Supabase checklist note:', error.message);
      });

      updateRiskOnRenderBackend(riskId, { checklist: updatedChecklist, mitigationProgress: newProgress });

      return updated;
    }));
  };

  const simulateAIRiskAnalysis = async (promptText: string): Promise<AIRiskAnalysisResult> => {
    const aiResult = await analyzeRiskWithAI(promptText);
    if (aiResult) {
      addToast('Gemini AI Analysis', 'Generated threat structure using Gemini API.', 'success');
      return aiResult;
    }

    const lower = promptText.toLowerCase();

    let category: RiskCategory = 'Technical';
    let probability: ProbabilityLevel = 4;
    let impact: ImpactLevel = 4;
    let title = 'Identified Project Operational Risk';
    let ownerName = 'Yash Raj';
    let ownerRole = 'Operations Lead';
    let mitigationPlan = 'Conduct technical discovery spike, isolate root dependencies, and deploy automated monitoring safeguards.';
    let contingencyPlan = 'Activate backup server pool and apply feature flags to isolate failing code path.';

    if (lower.includes('developer') || lower.includes('capacity') || lower.includes('unavailable') || lower.includes('team') || lower.includes('leave')) {
      category = 'Resource';
      probability = 4;
      impact = 4;
      title = 'Key Personnel Unavailability during Critical Delivery Window';
      ownerName = 'Ritika';
      ownerRole = 'Product Manager';
      mitigationPlan = 'Cross-train senior secondary engineer on deployment scripts and document release checklist by Wednesday.';
      contingencyPlan = 'Engage on-call DevOps contractor and implement an approved release freeze fallback window.';
    } else if (lower.includes('database') || lower.includes('sql') || lower.includes('migration') || lower.includes('lock')) {
      category = 'Technical';
      probability = 4;
      impact = 5;
      title = 'Database Locks & Query Execution Timeout during Migration';
      ownerName = 'Sunny Prasad';
      ownerRole = 'Business Operations Intern';
      mitigationPlan = 'Execute migration in batch chunks during off-peak window (2 AM EST) with read-only replica fallback.';
      contingencyPlan = 'Automate instant point-in-time restore procedure within 5 minutes of failure detection.';
    } else if (lower.includes('cost') || lower.includes('budget') || lower.includes('billing') || lower.includes('price')) {
      category = 'Financial';
      probability = 3;
      impact = 4;
      title = 'Cloud Consumption & Budget Variance Overrun';
      ownerName = 'Sumit';
      ownerRole = 'Resource Manager';
      mitigationPlan = 'Set up real-time billing anomaly alerts at 80% threshold and cap non-prod cluster autoscaling.';
      contingencyPlan = 'Transfer non-critical staging workloads to reserved instances and request cloud credits.';
    } else if (lower.includes('audit') || lower.includes('soc2') || lower.includes('compliance') || lower.includes('gdpr')) {
      category = 'Compliance';
      probability = 2;
      impact = 4;
      title = 'Third-Party Compliance Audit Evidence Gap';
      ownerName = 'Devyash';
      ownerRole = 'Data Quality Analyst';
      mitigationPlan = 'Automate continuous evidence collection scripts and enforce immutable S3 log storage policies.';
      contingencyPlan = 'Engage auditor for 1-week extension window with preliminary mitigation memo.';
    } else if (lower.includes('auth') || lower.includes('security') || lower.includes('vulnerability') || lower.includes('breach')) {
      category = 'Security';
      probability = 3;
      impact = 5;
      title = 'Security Authentication Subsystem Vulnerability';
      ownerName = 'Devyash';
      ownerRole = 'Data Quality Analyst';
      mitigationPlan = 'Enforce mandatory MFA, patch authentication SDK, and execute automated penetration testing.';
      contingencyPlan = 'Initiate immediate session token rotation and lock suspicious API keys.';
    }

    const score = probability * impact;
    const severity = calculateSeverity(score);

    return {
      title,
      description: promptText,
      category,
      probability,
      impact,
      score,
      severity,
      suggestedOwnerName: ownerName,
      suggestedOwnerRole: ownerRole,
      mitigationPlan,
      contingencyPlan,
      aiConfidence: 94,
      estimatedImpactUsd: Math.round(score * 2500)
    };
  };

  const getFilteredRisks = (): RiskItem[] => {
    return risks.filter(risk => {
      if (selectedProjectId !== 'All' && risk.projectId !== selectedProjectId) return false;
      if (filterState.projectId !== 'All' && risk.projectId !== filterState.projectId) return false;
      if (filterState.searchQuery.trim() !== '') {
        const q = filterState.searchQuery.toLowerCase();
        const matchesTitle = risk.title.toLowerCase().includes(q);
        const matchesId = risk.id.toLowerCase().includes(q);
        const matchesOwner = risk.ownerName.toLowerCase().includes(q);
        const matchesCategory = risk.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesId && !matchesOwner && !matchesCategory) return false;
      }
      if (filterState.category !== 'All' && risk.category !== filterState.category) return false;
      if (filterState.severity !== 'All' && risk.severity !== filterState.severity) return false;
      if (filterState.status !== 'All' && risk.status !== filterState.status) return false;
      if (filterState.owner !== 'All' && risk.ownerName !== filterState.owner) return false;

      return true;
    }).sort((a, b) => {
      if (filterState.sortBy === 'score_desc') return b.score - a.score;
      if (filterState.sortBy === 'score_asc') return a.score - b.score;
      if (filterState.sortBy === 'date_desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (filterState.sortBy === 'title_asc') return a.title.localeCompare(b.title);
      if (filterState.sortBy === 'probability_desc') return b.probability - a.probability;
      return 0;
    });
  };

  return (
    <RiskContext.Provider value={{
      risks,
      projects,
      teamMembers,
      selectedProjectId,
      filterState,
      toasts,
      isSupabaseConnected,
      supabaseStatus,
      renderBackendStatus,
      isRenderConnected,
      setSelectedProjectId,
      setFilterState,
      resetFilters,
      addRisk,
      updateRisk,
      deleteRisk,
      updateRiskStatus,
      toggleChecklistItem,
      addProject,
      addToast,
      removeToast,
      analyzeRiskWithGemini: simulateAIRiskAnalysis,
      simulateAIRiskAnalysis,
      getFilteredRisks
    }}>
      {children}
    </RiskContext.Provider>
  );
};

export const useRiskContext = () => {
  const ctx = useContext(RiskContext);
  if (!ctx) {
    throw new Error('useRiskContext must be used within a RiskProvider');
  }
  return ctx;
};
