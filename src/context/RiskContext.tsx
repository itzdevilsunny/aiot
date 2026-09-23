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
  setSelectedProjectId: (id: string) => void;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  addRisk: (newRisk: Omit<RiskItem, 'id' | 'createdAt' | 'lastUpdated' | 'score' | 'severity'>) => RiskItem;
  updateRisk: (id: string, updates: Partial<RiskItem>) => void;
  deleteRisk: (id: string) => void;
  updateRiskStatus: (id: string, status: StatusLevel) => void;
  toggleChecklistItem: (riskId: string, checklistId: string) => void;
  addToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
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
  const [risks, setRisks] = useState<RiskItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rrc_risks');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return MOCK_RISKS;
  });

  const [projects] = useState<Project[]>(MOCK_PROJECTS);
  const [teamMembers] = useState<TeamMember[]>(MOCK_TEAM_MEMBERS);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('All');
  const [filterState, setFilterState] = useState<FilterState>(initialFilterState);
  const [toasts, setToasts] = useState<ToastNotice[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rrc_risks', JSON.stringify(risks));
    }
  }, [risks]);

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
          author: 'Sunny P.',
          action: 'Created new risk entry in register.',
          type: 'creation'
        },
        ...(input.activityLogs || [])
      ]
    };

    setRisks(prev => [newRisk, ...prev]);
    addToast('Risk Created Successfully', `${newRisk.id}: ${newRisk.title} added to register.`, 'success');
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
        author: 'Sunny P.',
        action: 'Updated risk configuration or mitigation status.',
        type: 'mitigation_update' as const
      };

      return {
        ...item,
        ...updates,
        probability: newProb,
        impact: newImp,
        score,
        severity,
        lastUpdated: 'Just now',
        activityLogs: [updatedLog, ...(item.activityLogs || [])]
      };
    }));
    addToast('Risk Updated', `Changes saved for ${id}.`, 'info');
  };

  const deleteRisk = (id: string) => {
    setRisks(prev => prev.filter(r => r.id !== id));
    addToast('Risk Removed', `Risk ${id} deleted from workspace.`, 'warning');
  };

  const updateRiskStatus = (id: string, status: StatusLevel) => {
    updateRisk(id, { status });
    addToast('Status Changed', `Risk ${id} status moved to ${status}.`, 'success');
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

      return {
        ...risk,
        checklist: updatedChecklist,
        mitigationProgress: newProgress,
        lastUpdated: 'Just now'
      };
    }));
  };

  const simulateAIRiskAnalysis = async (promptText: string): Promise<AIRiskAnalysisResult> => {
    const lower = promptText.toLowerCase();

    let category: RiskCategory = 'Technical';
    let probability: ProbabilityLevel = 4;
    let impact: ImpactLevel = 4;
    let title = 'Identified Project Operational Risk';
    let ownerName = 'Yash Raj';
    let ownerRole = 'Senior Backend Architect';
    let mitigationPlan = 'Conduct technical discovery spike, isolate root dependencies, and deploy automated monitoring safeguards.';
    let contingencyPlan = 'Activate backup server pool and apply feature flags to isolate failing code path.';

    if (lower.includes('developer') || lower.includes('capacity') || lower.includes('unavailable') || lower.includes('team') || lower.includes('leave')) {
      category = 'Resource';
      probability = 4;
      impact = 4;
      title = 'Key Personnel Unavailability during Critical Delivery Window';
      ownerName = 'Ritika Sharma';
      ownerRole = 'Lead Product Manager';
      mitigationPlan = 'Cross-train senior secondary engineer on deployment scripts and document release checklist by Wednesday.';
      contingencyPlan = 'Engage on-call DevOps contractor and implement an approved release freeze fallback window.';
    } else if (lower.includes('database') || lower.includes('sql') || lower.includes('migration') || lower.includes('lock')) {
      category = 'Technical';
      probability = 4;
      impact = 5;
      title = 'Database Locks & Query Execution Timeout during Migration';
      ownerName = 'Marcus Vance';
      ownerRole = 'Principal DevOps Engineer';
      mitigationPlan = 'Execute migration in batch chunks during off-peak window (2 AM EST) with read-only replica fallback.';
      contingencyPlan = 'Automate instant pg_dump point-in-time restore procedure within 5 minutes of failure detection.';
    } else if (lower.includes('cost') || lower.includes('budget') || lower.includes('billing') || lower.includes('price')) {
      category = 'Financial';
      probability = 3;
      impact = 4;
      title = 'Cloud Consumption & Budget Variance Overrun';
      ownerName = 'David Chen';
      ownerRole = 'FinOps & Cloud Lead';
      mitigationPlan = 'Set up real-time billing anomaly alerts at 80% threshold and cap non-prod cluster autoscaling.';
      contingencyPlan = 'Transfer non-critical staging workloads to reserved instances and request cloud credits.';
    } else if (lower.includes('audit') || lower.includes('soc2') || lower.includes('compliance') || lower.includes('gdpr')) {
      category = 'Compliance';
      probability = 2;
      impact = 4;
      title = 'Third-Party Compliance Audit Evidence Gap';
      ownerName = 'Elena Rostova';
      ownerRole = 'Head of Legal & Security';
      mitigationPlan = 'Automate continuous evidence collection scripts and enforce immutable S3 log storage policies.';
      contingencyPlan = 'Engage auditor for 1-week extension window with preliminary mitigation memo.';
    } else if (lower.includes('auth') || lower.includes('security') || lower.includes('vulnerability') || lower.includes('breach')) {
      category = 'Security';
      probability = 3;
      impact = 5;
      title = 'Security Authentication Subsystem Vulnerability';
      ownerName = 'Elena Rostova';
      ownerRole = 'Head of Legal & Security';
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
      // Global project filter
      if (selectedProjectId !== 'All' && risk.projectId !== selectedProjectId) {
        return false;
      }
      // Workspace filter
      if (filterState.projectId !== 'All' && risk.projectId !== filterState.projectId) {
        return false;
      }
      // Search
      if (filterState.searchQuery.trim() !== '') {
        const q = filterState.searchQuery.toLowerCase();
        const matchesTitle = risk.title.toLowerCase().includes(q);
        const matchesId = risk.id.toLowerCase().includes(q);
        const matchesOwner = risk.ownerName.toLowerCase().includes(q);
        const matchesCategory = risk.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesId && !matchesOwner && !matchesCategory) return false;
      }
      // Category
      if (filterState.category !== 'All' && risk.category !== filterState.category) return false;
      // Severity
      if (filterState.severity !== 'All' && risk.severity !== filterState.severity) return false;
      // Status
      if (filterState.status !== 'All' && risk.status !== filterState.status) return false;
      // Owner
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
      setSelectedProjectId,
      setFilterState,
      resetFilters,
      addRisk,
      updateRisk,
      deleteRisk,
      updateRiskStatus,
      toggleChecklistItem,
      addToast,
      removeToast,
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
