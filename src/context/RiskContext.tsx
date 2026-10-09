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
  ImpactLevel,
  Control,
  MitigationAction,
  EvidenceRecord,
  KeyRiskIndicator,
  RiskReviewRecord,
  ApprovalRequest,
  AuditLogItem,
  UserRole
} from '../types/risk';
import { 
  MOCK_RISKS, 
  MOCK_PROJECTS, 
  MOCK_TEAM_MEMBERS, 
  MOCK_CONTROLS, 
  MOCK_MITIGATION_ACTIONS, 
  MOCK_EVIDENCE_RECORDS, 
  MOCK_KRIS, 
  MOCK_REVIEWS, 
  MOCK_APPROVALS, 
  MOCK_AUDIT_LOGS, 
  calculateSeverity 
} from '../data/mockData';
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

export interface WorkspaceSettings {
  workspaceName: string;
  riskIdPrefix: string;
  defaultReviewDays: number;
  cloudSyncMode: 'auto' | 'manual';
  currency: 'USD' | 'EUR' | 'GBP' | 'INR';
  criticalScoreThreshold: number;
  highScoreThreshold: number;
  mediumScoreThreshold: number;
  riskAppetiteThreshold: number;
}

export interface NotificationSettings {
  emailCriticalAlerts: boolean;
  dailyDigestEmail: boolean;
  slackWebhookAlerts: boolean;
  slaBreachAutoEscalation: boolean;
}

interface RiskContextType {
  risks: RiskItem[];
  projects: Project[];
  teamMembers: TeamMember[];
  controls: Control[];
  actions: MitigationAction[];
  evidence: EvidenceRecord[];
  kris: KeyRiskIndicator[];
  reviews: RiskReviewRecord[];
  approvals: ApprovalRequest[];
  auditLogs: AuditLogItem[];

  currentUser: TeamMember;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  selectedProjectId: string;
  filterState: FilterState;
  toasts: ToastNotice[];
  isSupabaseConnected: boolean;
  supabaseStatus: string;
  renderBackendStatus: string;
  isRenderConnected: boolean;
  workspaceSettings: WorkspaceSettings;
  notificationSettings: NotificationSettings;

  setCurrentUser: (user: TeamMember) => void;
  updateUserProfile: (profileUpdates: Partial<TeamMember>) => void;
  updateWorkspaceSettings: (settingsUpdates: Partial<WorkspaceSettings>) => void;
  updateNotificationSettings: (notificationUpdates: Partial<NotificationSettings>) => void;
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  setSelectedProjectId: (id: string) => void;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;

  addRisk: (newRisk: Omit<RiskItem, 'id' | 'createdAt' | 'lastUpdated' | 'score' | 'severity' | 'inherentScore' | 'inherentSeverity' | 'residualScore' | 'residualSeverity' | 'aboveAppetite'>) => RiskItem;
  updateRisk: (id: string, updates: Partial<RiskItem>) => void;
  deleteRisk: (id: string) => void;
  updateRiskStatus: (id: string, status: StatusLevel) => void;
  toggleChecklistItem: (riskId: string, checklistId: string) => void;

  addControl: (control: Omit<Control, 'id'>) => Control;
  updateControl: (id: string, updates: Partial<Control>) => void;
  deleteControl: (id: string) => void;

  addAction: (action: Omit<MitigationAction, 'id' | 'createdAt' | 'lastUpdated'>) => MitigationAction;
  updateAction: (id: string, updates: Partial<MitigationAction>) => void;
  deleteAction: (id: string) => void;

  addEvidence: (evidence: Omit<EvidenceRecord, 'id' | 'uploadTimestamp'>) => EvidenceRecord;
  deleteEvidence: (id: string) => void;

  addKRI: (kri: Omit<KeyRiskIndicator, 'id' | 'lastUpdated' | 'observations'>) => KeyRiskIndicator;
  recordKRIObservation: (kriId: string, value: number, note?: string) => void;

  addReview: (review: Omit<RiskReviewRecord, 'id'>) => RiskReviewRecord;
  createApprovalRequest: (req: Omit<ApprovalRequest, 'id' | 'createdTimestamp' | 'status'>) => ApprovalRequest;
  updateApprovalStatus: (id: string, status: 'Approved' | 'Rejected', decisionComments?: string) => void;

  addProject: (projectData: Omit<Project, 'id' | 'totalRisks' | 'criticalRisks' | 'mitigationProgress' | 'lastUpdated'>) => Project;
  addToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  logAuditEvent: (riskId: string, actionType: AuditLogItem['actionType'], summary: string, oldData?: any, newData?: any) => void;

  analyzeRiskWithGemini: (naturalLanguagePrompt: string) => Promise<AIRiskAnalysisResult>;
  simulateAIRiskAnalysis: (naturalLanguagePrompt: string) => Promise<AIRiskAnalysisResult>;
  getFilteredRisks: () => RiskItem[];
  formatCurrency: (val: number, customCurr?: string) => string;
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
  const [controls, setControls] = useState<Control[]>(MOCK_CONTROLS);
  const [actions, setActions] = useState<MitigationAction[]>(MOCK_MITIGATION_ACTIONS);
  const [evidence, setEvidence] = useState<EvidenceRecord[]>(MOCK_EVIDENCE_RECORDS);
  const [kris, setKris] = useState<KeyRiskIndicator[]>(MOCK_KRIS);
  const [reviews, setReviews] = useState<RiskReviewRecord[]>(MOCK_REVIEWS);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(MOCK_APPROVALS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(MOCK_AUDIT_LOGS);

  const [selectedProjectId, setSelectedProjectId] = useState<string>('All');
  const [filterState, setFilterState] = useState<FilterState>(initialFilterState);
  const [toasts, setToasts] = useState<ToastNotice[]>([]);
  const [isSupabaseConnected] = useState<boolean>(true);
  const [supabaseStatus, setSupabaseStatus] = useState<string>('Connected to Supabase Cloud');
  const [isRenderConnected, setIsRenderConnected] = useState<boolean>(true);
  const [renderBackendStatus, setRenderBackendStatus] = useState<string>('Connected to Render Backend (risk-register-copilot.onrender.com)');

  const [workspaceSettings, setWorkspaceSettings] = useState<WorkspaceSettings>({
    workspaceName: 'MNB Research Business Operations',
    riskIdPrefix: 'RSK-',
    defaultReviewDays: 30,
    cloudSyncMode: 'auto',
    currency: 'USD',
    criticalScoreThreshold: 17,
    highScoreThreshold: 10,
    mediumScoreThreshold: 5,
    riskAppetiteThreshold: 15
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailCriticalAlerts: true,
    dailyDigestEmail: true,
    slackWebhookAlerts: true,
    slaBreachAutoEscalation: true
  });

  const [currentUser, setCurrentUser] = useState<TeamMember>(MOCK_TEAM_MEMBERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchLatestData() {
      try {
        const { data, error } = await supabase.from('risks').select('*');
        if (data && data.length > 0) {
          const mappedRisks: RiskItem[] = data.map((row: any) => {
            const inhProb = row.inherent_probability || row.probability || 4;
            const inhImp = row.inherent_impact || row.impact || 4;
            const inhScore = inhProb * inhImp;
            const inhSev = calculateSeverity(inhScore);

            const resProb = row.residual_probability || Math.max(1, inhProb - 1);
            const resImp = row.residual_impact || Math.max(1, inhImp - 1);
            const resScore = resProb * resImp;
            const resSev = calculateSeverity(resScore);

            return {
              id: row.id,
              title: row.title,
              description: row.description,
              category: row.category,
              subcategory: row.subcategory,
              department: row.department || 'MNB Research · Business Operations',
              affectedProcess: row.affected_process,
              
              inherentProbability: inhProb,
              inherentImpact: inhImp,
              inherentScore: inhScore,
              inherentSeverity: inhSev,

              residualProbability: resProb,
              residualImpact: resImp,
              residualScore: resScore,
              residualSeverity: resSev,

              probability: inhProb,
              impact: inhImp,
              score: inhScore,
              severity: inhSev,

              treatmentStrategy: row.treatment_strategy || 'Mitigate',
              aboveAppetite: resScore > workspaceSettings.riskAppetiteThreshold,
              acceptanceStatus: row.acceptance_status || 'None',
              reviewFrequency: row.review_frequency || 'Monthly',
              nextReviewDate: row.next_review_date || '2026-10-31',

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
              linkedControlIds: row.linked_control_ids || [],
              linkedActionIds: row.linked_action_ids || [],
              linkedEvidenceIds: row.linked_evidence_ids || [],
              aiSuggested: row.ai_suggested,
              aiConfidence: row.ai_confidence,
              estimatedImpactUsd: row.estimated_impact_usd,
              lastUpdated: row.last_updated || 'Just now',
              createdAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '2026-09-28'
            };
          });
          setRisks(mappedRisks);
          setSupabaseStatus('⚡ Supabase Real-Time Sync Active');
        }
      } catch (err) {
        console.log('Supabase sync note:', err);
      }
    }

    async function initServices() {
      await fetchLatestData();
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('risk_copilot_auth');
      const savedUserEmail = localStorage.getItem('risk_copilot_user');
      if (auth === 'true') {
        setIsAuthenticated(true);
        if (savedUserEmail) {
          const found = MOCK_TEAM_MEMBERS.find(m => m.email.toLowerCase() === savedUserEmail.toLowerCase());
          if (found) setCurrentUser(found);
        }
      } else {
        setIsAuthenticated(false);
      }

      const savedProfile = localStorage.getItem('risk_copilot_user_profile');
      if (savedProfile) {
        try { setCurrentUser(prev => ({ ...prev, ...JSON.parse(savedProfile) })); } catch (e) {}
      }

      const savedWs = localStorage.getItem('risk_copilot_workspace_settings');
      if (savedWs) {
        try { setWorkspaceSettings(prev => ({ ...prev, ...JSON.parse(savedWs) })); } catch (e) {}
      }

      const savedNotifs = localStorage.getItem('risk_copilot_notification_settings');
      if (savedNotifs) {
        try { setNotificationSettings(prev => ({ ...prev, ...JSON.parse(savedNotifs) })); } catch (e) {}
      }
    }
    setIsAuthLoading(false);
  }, []);

  const addToast = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => { removeToast(id); }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const logAuditEvent = (riskId: string, actionType: AuditLogItem['actionType'], summary: string, oldData?: any, newData?: any) => {
    const newLog: AuditLogItem = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      riskId,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actionType,
      changesSummary: summary,
      oldData,
      newData,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Persist to Supabase audit log
    supabase.from('risk_audit_logs').insert([{
      risk_id: riskId,
      action_type: actionType,
      actor_name: currentUser.name,
      actor_role: currentUser.role,
      changes_summary: summary,
      old_data: oldData,
      new_data: newData
    }]).then(() => {});
  };

  const resetFilters = () => {
    setFilterState(initialFilterState);
  };

  const addRisk = (input: Omit<RiskItem, 'id' | 'createdAt' | 'lastUpdated' | 'score' | 'severity' | 'inherentScore' | 'inherentSeverity' | 'residualScore' | 'residualSeverity' | 'aboveAppetite'>): RiskItem => {
    const nextNum = 100 + risks.length + Math.floor(Math.random() * 100);
    const id = `RSK-${nextNum}`;
    
    const inhProb = input.inherentProbability || input.probability || 4;
    const inhImp = input.inherentImpact || input.impact || 4;
    const inhScore = inhProb * inhImp;
    const inhSev = calculateSeverity(inhScore);

    const resProb = input.residualProbability || Math.max(1, inhProb - 1);
    const resImp = input.residualImpact || Math.max(1, inhImp - 1);
    const resScore = resProb * resImp;
    const resSev = calculateSeverity(resScore);

    const now = new Date().toISOString().split('T')[0];
    const aboveAppetite = resScore > workspaceSettings.riskAppetiteThreshold;

    const newRisk: RiskItem = {
      ...input,
      id,
      inherentProbability: inhProb,
      inherentImpact: inhImp,
      inherentScore: inhScore,
      inherentSeverity: inhSev,

      residualProbability: resProb,
      residualImpact: resImp,
      residualScore: resScore,
      residualSeverity: resSev,

      probability: inhProb,
      impact: inhImp,
      score: inhScore,
      severity: inhSev,

      treatmentStrategy: input.treatmentStrategy || 'Mitigate',
      aboveAppetite,
      createdAt: now,
      lastUpdated: 'Just now',
      activityLogs: [
        {
          id: `act-${Date.now()}`,
          timestamp: 'Just now',
          author: currentUser.name,
          action: `Created new risk record. Inherent score: ${inhScore}, Residual score: ${resScore}.`,
          type: 'creation'
        },
        ...(input.activityLogs || [])
      ]
    };

    setRisks(prev => [newRisk, ...prev]);
    addToast('Risk Registered', `${newRisk.id}: ${newRisk.title} added to register.`, 'success');
    logAuditEvent(newRisk.id, 'INSERT', `Created risk ${newRisk.id} with Inherent Score ${inhScore} and Residual Score ${resScore}.`, null, newRisk);

    // Sync to Supabase
    supabase.from('risks').upsert([{
      id: newRisk.id,
      title: newRisk.title,
      description: newRisk.description,
      category: newRisk.category,
      subcategory: newRisk.subcategory,
      department: newRisk.department,
      affected_process: newRisk.affectedProcess,
      probability: newRisk.probability,
      impact: newRisk.impact,
      score: newRisk.score,
      severity: newRisk.severity,
      inherent_probability: newRisk.inherentProbability,
      inherent_impact: newRisk.inherentImpact,
      residual_probability: newRisk.residualProbability,
      residual_impact: newRisk.residualImpact,
      treatment_strategy: newRisk.treatmentStrategy,
      status: newRisk.status,
      project_id: newRisk.projectId,
      project_name: newRisk.projectName,
      owner_id: newRisk.ownerId,
      owner_name: newRisk.ownerName,
      owner_role: newRisk.ownerRole,
      mitigation_plan: newRisk.mitigationPlan,
      contingency_plan: newRisk.contingencyPlan,
      mitigation_progress: newRisk.mitigationProgress,
      due_date: newRisk.dueDate,
      checklist: newRisk.checklist,
      activity_logs: newRisk.activityLogs,
      last_updated: 'Just now'
    }], { onConflict: 'id' }).then(({ error }) => {
      if (error) console.log('Supabase upsert note:', error.message);
    });

    syncRiskToRenderBackend(newRisk);
    return newRisk;
  };

  const updateRisk = (id: string, updates: Partial<RiskItem>) => {
    let oldRisk: RiskItem | undefined;
    setRisks(prev => prev.map(item => {
      if (item.id !== id) return item;
      oldRisk = item;

      const inhProb = updates.inherentProbability ?? updates.probability ?? item.inherentProbability;
      const inhImp = updates.inherentImpact ?? updates.impact ?? item.inherentImpact;
      const inhScore = inhProb * inhImp;
      const inhSev = calculateSeverity(inhScore);

      const resProb = updates.residualProbability ?? item.residualProbability;
      const resImp = updates.residualImpact ?? item.residualImpact;
      const resScore = resProb * resImp;
      const resSev = calculateSeverity(resScore);
      const aboveAppetite = resScore > workspaceSettings.riskAppetiteThreshold;

      const updatedLog = {
        id: `act-${Date.now()}`,
        timestamp: 'Just now',
        author: currentUser.name,
        action: 'Updated risk configuration or mitigation assessment.',
        type: 'mitigation_update' as const
      };

      const updatedItem: RiskItem = {
        ...item,
        ...updates,
        inherentProbability: inhProb,
        inherentImpact: inhImp,
        inherentScore: inhScore,
        inherentSeverity: inhSev,

        residualProbability: resProb,
        residualImpact: resImp,
        residualScore: resScore,
        residualSeverity: resSev,

        probability: inhProb,
        impact: inhImp,
        score: inhScore,
        severity: inhSev,
        aboveAppetite,
        lastUpdated: 'Just now',
        activityLogs: [updatedLog, ...(item.activityLogs || [])]
      };

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

      updateRiskOnRenderBackend(id, updates);
      return updatedItem;
    }));

    if (oldRisk) {
      logAuditEvent(id, 'UPDATE', `Updated risk ${id}. New status: ${updates.status || oldRisk.status}.`, oldRisk, updates);
    }
    addToast('Risk Updated', `Changes saved for ${id}.`, 'info');
  };

  const deleteRisk = (id: string) => {
    const target = risks.find(r => r.id === id);
    setRisks(prev => prev.filter(r => r.id !== id));
    addToast('Risk Removed', `Risk ${id} deleted from workspace.`, 'warning');
    if (target) logAuditEvent(id, 'DELETE', `Archived/Deleted risk ${id}: ${target.title}.`, target, null);

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
      }).eq('id', riskId).then(() => {});

      updateRiskOnRenderBackend(riskId, { checklist: updatedChecklist, mitigationProgress: newProgress });
      return updated;
    }));
  };

  // Controls Management
  const addControl = (controlInput: Omit<Control, 'id'>): Control => {
    const id = `CTRL-${100 + controls.length + 1}`;
    const newControl: Control = { ...controlInput, id };
    setControls(prev => [newControl, ...prev]);
    addToast('Control Created', `Control ${id}: ${newControl.name} added.`, 'success');
    logAuditEvent(id, 'INSERT', `Created control ${id}: ${newControl.name}`, null, newControl);
    return newControl;
  };

  const updateControl = (id: string, updates: Partial<Control>) => {
    setControls(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    addToast('Control Updated', `Updated details for ${id}.`, 'info');
  };

  const deleteControl = (id: string) => {
    setControls(prev => prev.filter(c => c.id !== id));
    addToast('Control Removed', `Control ${id} removed.`, 'warning');
  };

  // Actions Management
  const addAction = (actionInput: Omit<MitigationAction, 'id' | 'createdAt' | 'lastUpdated'>): MitigationAction => {
    const id = `ACT-${100 + actions.length + 1}`;
    const now = new Date().toISOString().split('T')[0];
    const newAction: MitigationAction = {
      ...actionInput,
      id,
      createdAt: now,
      lastUpdated: 'Just now'
    };
    setActions(prev => [newAction, ...prev]);
    addToast('Action Created', `Mitigation Action ${id} assigned to ${newAction.assignedOwnerName}.`, 'success');
    logAuditEvent(actionInput.riskId, 'INSERT', `Added mitigation action ${id}: ${newAction.title}`, null, newAction);
    return newAction;
  };

  const updateAction = (id: string, updates: Partial<MitigationAction>) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, ...updates, lastUpdated: 'Just now' } : a));
    addToast('Action Updated', `Updated mitigation action ${id}.`, 'info');
  };

  const deleteAction = (id: string) => {
    setActions(prev => prev.filter(a => a.id !== id));
    addToast('Action Deleted', `Action ${id} removed.`, 'warning');
  };

  // Evidence Management
  const addEvidence = (evidenceInput: Omit<EvidenceRecord, 'id' | 'uploadTimestamp'>): EvidenceRecord => {
    const id = `EVD-${100 + evidence.length + 1}`;
    const newEv: EvidenceRecord = {
      ...evidenceInput,
      id,
      uploadTimestamp: new Date().toISOString()
    };
    setEvidence(prev => [newEv, ...prev]);
    addToast('Evidence Uploaded', `Uploaded ${newEv.fileName} linked to risk/control.`, 'success');
    if (newEv.linkedRiskId) {
      logAuditEvent(newEv.linkedRiskId, 'INSERT', `Uploaded evidence document ${newEv.fileName}.`, null, newEv);
    }
    return newEv;
  };

  const deleteEvidence = (id: string) => {
    setEvidence(prev => prev.filter(e => e.id !== id));
    addToast('Evidence Removed', `Document ${id} deleted.`, 'warning');
  };

  // KRIs
  const addKRI = (kriInput: Omit<KeyRiskIndicator, 'id' | 'lastUpdated' | 'observations'>): KeyRiskIndicator => {
    const id = `KRI-${100 + kris.length + 1}`;
    const newKRI: KeyRiskIndicator = {
      ...kriInput,
      id,
      observations: [{
        id: `obs-${Date.now()}`,
        timestamp: new Date().toISOString().split('T')[0],
        value: kriInput.currentValue,
        recordedBy: currentUser.name,
        note: 'Initial measurement baseline'
      }],
      lastUpdated: 'Just now'
    };
    setKris(prev => [newKRI, ...prev]);
    addToast('KRI Created', `Key Risk Indicator ${id} configured.`, 'success');
    return newKRI;
  };

  const recordKRIObservation = (kriId: string, value: number, note?: string) => {
    setKris(prev => prev.map(kri => {
      if (kri.id !== kriId) return kri;
      let status: 'Normal' | 'Warning' | 'Critical' = 'Normal';
      if (value >= kri.criticalThreshold) status = 'Critical';
      else if (value >= kri.warningThreshold) status = 'Warning';

      const prevVal = kri.currentValue;
      const trend = value > prevVal ? 'Up' : value < prevVal ? 'Down' : 'Stable';

      const newObs = {
        id: `obs-${Date.now()}`,
        timestamp: new Date().toISOString().split('T')[0],
        value,
        recordedBy: currentUser.name,
        note
      };

      return {
        ...kri,
        currentValue: value,
        triggerStatus: status,
        trendDirection: trend,
        observations: [newObs, ...kri.observations],
        lastUpdated: 'Just now'
      };
    }));
    addToast('KRI Observation Recorded', `Updated ${kriId} metric reading.`, 'info');
  };

  // Reviews & Approvals
  const addReview = (reviewInput: Omit<RiskReviewRecord, 'id'>): RiskReviewRecord => {
    const id = `REV-${100 + reviews.length + 1}`;
    const newRev: RiskReviewRecord = { ...reviewInput, id };
    setReviews(prev => [newRev, ...prev]);
    addToast('Review Recorded', `Completed risk review for ${newRev.riskId}.`, 'success');
    logAuditEvent(newRev.riskId, 'UPDATE', `Conduct risk review: ${newRev.summary}`, null, newRev);
    return newRev;
  };

  const createApprovalRequest = (reqInput: Omit<ApprovalRequest, 'id' | 'createdTimestamp' | 'status'>): ApprovalRequest => {
    const id = `APR-${100 + approvals.length + 1}`;
    const newReq: ApprovalRequest = {
      ...reqInput,
      id,
      status: 'Pending',
      createdTimestamp: new Date().toISOString()
    };
    setApprovals(prev => [newReq, ...prev]);
    addToast('Approval Requested', `Submitted ${newReq.type} request for ${newReq.riskId}.`, 'info');
    logAuditEvent(newReq.riskId, 'ACCEPTANCE', `Requested ${newReq.type}. Reason: ${newReq.reason}`, null, newReq);
    return newReq;
  };

  const updateApprovalStatus = (id: string, status: 'Approved' | 'Rejected', decisionComments?: string) => {
    setApprovals(prev => prev.map(a => {
      if (a.id !== id) return a;
      const updated = {
        ...a,
        status,
        decisionComments,
        decidedTimestamp: new Date().toISOString()
      };

      if (status === 'Approved' && a.type === 'Risk Acceptance') {
        updateRisk(a.riskId, { acceptanceStatus: 'Accepted', aboveAppetite: false });
      } else if (status === 'Rejected' && a.type === 'Risk Acceptance') {
        updateRisk(a.riskId, { acceptanceStatus: 'Rejected' });
      }
      return updated;
    }));
    addToast('Approval Decision Saved', `Request ${id} marked as ${status}.`, status === 'Approved' ? 'success' : 'warning');
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
    return newProj;
  };

  const simulateAIRiskAnalysis = async (promptText: string): Promise<AIRiskAnalysisResult> => {
    const aiResult = await analyzeRiskWithAI(promptText);
    if (aiResult) {
      addToast('Gemini AI Analysis', 'Generated structured threat analysis using Gemini API.', 'success');
      return aiResult;
    }

    const lower = promptText.toLowerCase();
    let category: RiskCategory = 'Technical';
    let prob: ProbabilityLevel = 4;
    let imp: ImpactLevel = 4;
    let title = 'Identified Project Operational Risk';
    let ownerName = 'Sunny Prasad';
    let ownerRole = 'Business Operations Intern';
    let mitigationPlan = 'Conduct technical discovery spike, isolate root dependencies, and deploy automated monitoring safeguards.';
    let contingencyPlan = 'Activate backup server pool and apply feature flags to isolate failing code path.';

    if (lower.includes('developer') || lower.includes('team') || lower.includes('capacity')) {
      category = 'Resource';
      prob = 4; imp = 4;
      title = 'Key Engineering Personnel Capacity Slip';
      ownerName = 'Sumit'; ownerRole = 'Resource Manager';
      mitigationPlan = 'Cross-train senior secondary engineer on deployment scripts and document release playbooks.';
      contingencyPlan = 'Engage on-call DevOps contractor and freeze non-critical features.';
    } else if (lower.includes('database') || lower.includes('migration') || lower.includes('sql')) {
      category = 'Technical';
      prob = 5; imp = 4;
      title = 'PostgreSQL Migration Row Lock & Timeout';
      ownerName = 'Sunny Prasad'; ownerRole = 'Business Operations Intern';
      mitigationPlan = 'Execute migration in batch chunks during off-peak window with read-only replica fallback.';
      contingencyPlan = 'Automate instant point-in-time restore procedure within 5 minutes of failure detection.';
    } else if (lower.includes('cost') || lower.includes('budget') || lower.includes('price')) {
      category = 'Financial';
      prob = 3; imp = 4;
      title = 'Cloud Consumption & Infrastructure Budget Overrun';
      ownerName = 'Sumit'; ownerRole = 'Resource Manager';
      mitigationPlan = 'Set real-time billing anomaly alerts at 80% threshold and cap non-prod cluster autoscaling.';
      contingencyPlan = 'Transfer non-critical staging workloads to reserved instances.';
    }

    const score = prob * imp;
    const severity = calculateSeverity(score);

    return {
      title,
      description: promptText,
      category,
      probability: prob,
      impact: imp,
      score,
      severity,
      inherentProbability: prob,
      inherentImpact: imp,
      residualProbability: Math.max(1, prob - 1) as ProbabilityLevel,
      residualImpact: Math.max(1, imp - 1) as ImpactLevel,
      treatmentStrategy: 'Mitigate',
      suggestedOwnerName: ownerName,
      suggestedOwnerRole: ownerRole,
      mitigationPlan,
      contingencyPlan,
      aiConfidence: 94,
      estimatedImpactUsd: Math.round(score * 2500),
      suggestedControls: ['Automated CI/CD Validation', 'Read-Only DB Replica'],
      suggestedActions: ['Benchmark staging workload', 'Deploy health monitoring script']
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
      if (filterState.sortBy === 'residual_desc') return b.residualScore - a.residualScore;
      return 0;
    });
  };

  const formatCurrency = (val: number, customCurr?: string): string => {
    const targetCurr = customCurr || workspaceSettings?.currency || 'USD';
    const rates: Record<string, { symbol: string; rate: number }> = {
      USD: { symbol: '$', rate: 1.0 },
      EUR: { symbol: '€', rate: 0.92 },
      GBP: { symbol: '£', rate: 0.78 },
      INR: { symbol: '₹', rate: 83.5 }
    };
    const config = rates[targetCurr] || rates.USD;
    const converted = val * config.rate;
    if (converted >= 1_000_000) return `${config.symbol}${(converted / 1_000_000).toFixed(2)}M`;
    if (converted >= 1_000) return `${config.symbol}${(converted / 1_000).toFixed(0)}K`;
    return `${config.symbol}${Math.round(converted).toLocaleString()}`;
  };

  const updateUserProfile = (profileUpdates: Partial<TeamMember>) => {
    setCurrentUser(prev => {
      const updated = { ...prev, ...profileUpdates };
      if (typeof window !== 'undefined') {
        localStorage.setItem('risk_copilot_user_profile', JSON.stringify(updated));
      }
      return updated;
    });
    addToast('Profile Updated', 'User profile details synchronized across workspace.', 'success');
  };

  const updateWorkspaceSettings = (settingsUpdates: Partial<WorkspaceSettings>) => {
    setWorkspaceSettings(prev => {
      const updated = { ...prev, ...settingsUpdates };
      if (typeof window !== 'undefined') {
        localStorage.setItem('risk_copilot_workspace_settings', JSON.stringify(updated));
      }
      return updated;
    });
    addToast('Workspace Configured', 'Workspace settings and scoring thresholds saved.', 'success');
  };

  const updateNotificationSettings = (notificationUpdates: Partial<NotificationSettings>) => {
    setNotificationSettings(prev => {
      const updated = { ...prev, ...notificationUpdates };
      if (typeof window !== 'undefined') {
        localStorage.setItem('risk_copilot_notification_settings', JSON.stringify(updated));
      }
      return updated;
    });
    addToast('Notification Rules Updated', 'Preferences updated for email, Slack, and SLA alerts.', 'success');
  };

  const login = (email: string, password?: string): boolean => {
    if (!password || password.trim().length === 0) {
      addToast('Authentication Failed', 'Password is required to sign in.', 'error');
      return false;
    }
    const found = teamMembers.find(m => m.email.toLowerCase() === email.toLowerCase());
    let userToSet = found;
    if (!userToSet) {
      userToSet = {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0].replace('.', ' '),
        role: 'Risk Assessor Lead',
        userRole: 'Risk Manager',
        email: email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        department: 'MNB Research Operations',
        assignedRisksCount: 0,
        openRisksCount: 0,
        criticalRisksCount: 0,
        mitigationProgress: 100
      };
    }
    setCurrentUser(userToSet);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('risk_copilot_auth', 'true');
      localStorage.setItem('risk_copilot_user', email);
    }
    addToast('Authentication Successful', `Logged in as ${userToSet.name}. Access granted.`, 'success');
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('risk_copilot_auth');
      localStorage.removeItem('risk_copilot_user');
    }
    addToast('Signed Out', 'Session terminated. Password required to enter.', 'info');
  };

  return (
    <RiskContext.Provider value={{
      risks,
      projects,
      teamMembers,
      controls,
      actions,
      evidence,
      kris,
      reviews,
      approvals,
      auditLogs,
      currentUser,
      isAuthenticated,
      isAuthLoading,
      selectedProjectId,
      filterState,
      toasts,
      isSupabaseConnected,
      supabaseStatus,
      renderBackendStatus,
      isRenderConnected,
      workspaceSettings,
      notificationSettings,
      setCurrentUser,
      updateUserProfile,
      updateWorkspaceSettings,
      updateNotificationSettings,
      login,
      logout,
      setSelectedProjectId,
      setFilterState,
      resetFilters,
      addRisk,
      updateRisk,
      deleteRisk,
      updateRiskStatus,
      toggleChecklistItem,
      addControl,
      updateControl,
      deleteControl,
      addAction,
      updateAction,
      deleteAction,
      addEvidence,
      deleteEvidence,
      addKRI,
      recordKRIObservation,
      addReview,
      createApprovalRequest,
      updateApprovalStatus,
      addProject,
      addToast,
      removeToast,
      logAuditEvent,
      analyzeRiskWithGemini: simulateAIRiskAnalysis,
      simulateAIRiskAnalysis,
      getFilteredRisks,
      formatCurrency
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
