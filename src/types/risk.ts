export type RiskCategory = 
  | 'Technical' 
  | 'Resource' 
  | 'Financial' 
  | 'Schedule' 
  | 'Operational' 
  | 'Security' 
  | 'Compliance' 
  | 'External';

export type ProbabilityLevel = 1 | 2 | 3 | 4 | 5; // 1: Very Low, 2: Low, 3: Medium, 4: High, 5: Very High / Almost Certain
export type ImpactLevel = 1 | 2 | 3 | 4 | 5;      // 1: Negligible, 2: Minor, 3: Moderate, 4: Major, 5: Catastrophic

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export const calculateSeverity = (score: number): SeverityLevel => {
  if (score >= 17) return 'Critical';
  if (score >= 10) return 'High';
  if (score >= 5) return 'Medium';
  return 'Low';
};

export type StatusLevel = 'Open' | 'Monitoring' | 'Mitigated' | 'Closed';
export type TreatmentStrategy = 'Mitigate' | 'Accept' | 'Transfer' | 'Avoid' | 'Escalate';
export type UserRole = 'Admin' | 'Risk Manager' | 'Risk Owner' | 'Approver' | 'Auditor';

export type LifecycleStage = 
  | 'Identify'
  | 'Assess'
  | 'Prioritise'
  | 'Treat'
  | 'Assign'
  | 'Monitor'
  | 'Review'
  | 'Approve'
  | 'Report'
  | 'Close';

export interface LifecycleStepInfo {
  stage: LifecycleStage;
  label: string;
  step: number;
  description: string;
  category: 'Assessment' | 'Treatment' | 'Governance' | 'Closure';
}

export const LIFECYCLE_STAGES: LifecycleStepInfo[] = [
  { stage: 'Identify', label: 'Identify', step: 1, description: 'Threat discovery, category, and affected process', category: 'Assessment' },
  { stage: 'Assess', label: 'Assess', step: 2, description: 'Inherent 5x5 probability, impact & exposure math', category: 'Assessment' },
  { stage: 'Prioritise', label: 'Prioritise', step: 3, description: 'Severity grading & risk appetite breach check', category: 'Assessment' },
  { stage: 'Treat', label: 'Treat', step: 4, description: 'Treatment strategy selection (Mitigate/Avoid/Transfer/Accept)', category: 'Treatment' },
  { stage: 'Assign', label: 'Assign', step: 5, description: 'Primary owner & accountable lead allocation', category: 'Treatment' },
  { stage: 'Monitor', label: 'Monitor', step: 6, description: 'Controls, mitigation actions, evidence & KRI telemetry', category: 'Treatment' },
  { stage: 'Review', label: 'Review', step: 7, description: 'Scheduled cadence audit & residual score recalculation', category: 'Governance' },
  { stage: 'Approve', label: 'Approve', step: 8, description: 'Formal Risk Acceptance & CRO governance decision', category: 'Governance' },
  { stage: 'Report', label: 'Report', step: 9, description: 'Executive brief, Board packet & SOC 2 audit trail', category: 'Governance' },
  { stage: 'Close', label: 'Close', step: 10, description: 'Resolution verification & verified lifecycle sign-off', category: 'Closure' },
];

export interface ActionChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  assignedTo?: string;
  completedAt?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  author: string;
  avatar?: string;
  action: string;
  details?: string;
  type: 'creation' | 'ai_analysis' | 'status_change' | 'mitigation_update' | 'owner_assignment' | 'approval' | 'acceptance';
}

export interface RiskItem {
  id: string; // e.g. "RSK-101"
  title: string;
  description: string;
  category: RiskCategory;
  subcategory?: string;
  department?: string;
  affectedProcess?: string;
  
  // Inherent Risk
  inherentProbability?: ProbabilityLevel;
  inherentImpact?: ImpactLevel;
  inherentScore?: number; // inherentProbability * inherentImpact (1..25)
  inherentSeverity?: SeverityLevel;

  // Residual Risk
  residualProbability?: ProbabilityLevel;
  residualImpact?: ImpactLevel;
  residualScore?: number; // residualProbability * residualImpact (1..25)
  residualSeverity?: SeverityLevel;

  // Compatibility fields
  probability: ProbabilityLevel;
  impact: ImpactLevel;
  score: number;
  severity: SeverityLevel;

  // Governance & Appetite
  lifecycleStage?: LifecycleStage;
  treatmentStrategy?: TreatmentStrategy;
  aboveAppetite?: boolean;
  acceptanceStatus?: 'None' | 'Requested' | 'Accepted' | 'Rejected' | 'Expired';
  reviewFrequency?: 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual';
  nextReviewDate?: string;

  status: StatusLevel;
  projectId: string; // e.g. "proj-1"
  projectName: string;
  ownerId: string;
  ownerName: string;
  ownerRole: string;
  ownerAvatar?: string;
  coOwnerName?: string;
  coOwnerRole?: string;
  
  mitigationPlan: string;
  contingencyPlan: string;
  mitigationProgress: number; // 0..100 %
  dueDate?: string;
  
  checklist: ActionChecklistItem[];
  activityLogs: ActivityLog[];

  // Connected entity counters & IDs
  linkedControlIds?: string[];
  linkedActionIds?: string[];
  linkedEvidenceIds?: string[];
  
  aiSuggested?: boolean;
  aiConfidence?: number; // e.g. 94%
  estimatedImpactUsd?: number;
  lastUpdated: string;
  createdAt: string;
}

export interface Control {
  id: string; // e.g. "CTRL-101"
  name: string;
  description: string;
  category: string;
  type: 'Preventive' | 'Detective' | 'Corrective';
  objective: string;
  ownerName: string;
  ownerRole: string;
  implementationStatus: 'Implemented' | 'In Progress' | 'Planned' | 'Deprecated';
  effectiveness: 'Effective' | 'Partially Effective' | 'Ineffective';
  testStatus: 'Passed' | 'Failed' | 'Pending Test';
  lastTestDate?: string;
  nextTestDate?: string;
  linkedRiskIds: string[];
}

export interface MitigationAction {
  id: string; // e.g. "ACT-101"
  riskId: string;
  riskTitle?: string;
  title: string;
  description: string;
  linkedControlId?: string;
  assignedOwnerName: string;
  assignedOwnerRole: string;
  priority: 'High' | 'Medium' | 'Low';
  startDate: string;
  dueDate: string;
  status: 'Not Started' | 'In Progress' | 'Blocked' | 'Pending Verification' | 'Completed';
  progressPct: number;
  completionEvidence?: string;
  verificationStatus: 'Verified' | 'Pending Verification' | 'Unverified';
  createdAt: string;
  lastUpdated: string;
}

export interface EvidenceRecord {
  id: string; // e.g. "EVD-101"
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  linkedRiskId?: string;
  linkedControlId?: string;
  linkedActionId?: string;
  uploadedBy: string;
  uploadTimestamp: string;
  description: string;
  validityExpiryDate?: string;
  verificationStatus: 'Verified' | 'Pending' | 'Expired';
  verifierName?: string;
}

export interface KRIObservation {
  id: string;
  timestamp: string;
  value: number;
  recordedBy: string;
  note?: string;
}

export interface KeyRiskIndicator {
  id: string; // e.g. "KRI-101"
  name: string;
  description: string;
  linkedRiskId: string;
  linkedRiskTitle?: string;
  linkedControlId?: string;
  ownerName: string;
  measurementUnit: string;
  dataSource: 'Manual Entry' | 'Telemetry Script' | 'System Metric';
  currentValue: number;
  warningThreshold: number;
  criticalThreshold: number;
  reportingFrequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
  trendDirection: 'Up' | 'Down' | 'Stable';
  triggerStatus: 'Normal' | 'Warning' | 'Critical';
  observations: KRIObservation[];
  lastUpdated: string;
}

export interface RiskReviewRecord {
  id: string; // e.g. "REV-101"
  riskId: string;
  riskTitle?: string;
  reviewDate: string;
  reviewerName: string;
  reviewerRole: string;
  previousScore: number;
  newScore: number;
  summary: string;
  findings: string;
  nextReviewDate: string;
  status: 'Completed' | 'Pending' | 'Overdue';
}

export interface ApprovalRequest {
  id: string; // e.g. "APR-101"
  riskId: string;
  riskTitle?: string;
  type: 'Risk Acceptance' | 'Score Change' | 'Treatment Sign-off';
  requestedBy: string;
  approverName: string;
  residualScore: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  decisionComments?: string;
  expiryDate?: string;
  createdTimestamp: string;
  decidedTimestamp?: string;
}

export interface AuditLogItem {
  id: string;
  riskId: string;
  actorName: string;
  actorRole: string;
  actionType: 'INSERT' | 'UPDATE' | 'DELETE' | 'APPROVAL' | 'ACCEPTANCE' | 'IMPORT' | 'EXPORT';
  changesSummary: string;
  oldData?: any;
  newData?: any;
  timestamp: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description: string;
  leadName: string;
  totalRisks: number;
  criticalRisks: number;
  mitigationProgress: number;
  status: 'Active' | 'On Track' | 'At Risk' | 'Completed';
  lastUpdated: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  department: string;
  assignedRisksCount: number;
  openRisksCount: number;
  criticalRisksCount: number;
  mitigationProgress: number;
  userRole?: UserRole;
}

export interface FilterState {
  searchQuery: string;
  category: string; // 'All' or specific
  severity: string; // 'All' or specific
  status: string;   // 'All' or specific
  owner: string;    // 'All' or specific
  department?: string; // 'All' or specific
  projectId: string; // 'All' or specific
  sortBy: 'score_desc' | 'score_asc' | 'date_desc' | 'title_asc' | 'probability_desc' | 'residual_desc';
}

export interface AIRiskAnalysisResult {
  title: string;
  description: string;
  category: RiskCategory;
  probability: ProbabilityLevel;
  impact: ImpactLevel;
  score: number;
  severity: SeverityLevel;
  inherentProbability?: ProbabilityLevel;
  inherentImpact?: ImpactLevel;
  residualProbability?: ProbabilityLevel;
  residualImpact?: ImpactLevel;
  treatmentStrategy?: TreatmentStrategy;
  suggestedOwnerName: string;
  suggestedOwnerRole: string;
  mitigationPlan: string;
  contingencyPlan: string;
  aiConfidence: number;
  estimatedImpactUsd: number;
  suggestedControls?: string[];
  suggestedActions?: string[];
  suggestedKRIs?: string[];
}
