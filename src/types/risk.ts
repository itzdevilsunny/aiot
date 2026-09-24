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
export type StatusLevel = 'Open' | 'Monitoring' | 'Mitigated' | 'Closed';

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
  type: 'creation' | 'ai_analysis' | 'status_change' | 'mitigation_update' | 'owner_assignment';
}

export interface RiskItem {
  id: string; // e.g. "RSK-104"
  title: string;
  description: string;
  category: RiskCategory;
  probability: ProbabilityLevel;
  impact: ImpactLevel;
  score: number; // probability * impact (1..25)
  severity: SeverityLevel;
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
  aiSuggested?: boolean;
  aiConfidence?: number; // e.g. 94%
  estimatedImpactUsd?: number;
  lastUpdated: string;
  createdAt: string;
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
}

export interface FilterState {
  searchQuery: string;
  category: string; // 'All' or specific
  severity: string; // 'All' or specific
  status: string;   // 'All' or specific
  owner: string;    // 'All' or specific
  department?: string; // 'All' or specific
  projectId: string; // 'All' or specific
  sortBy: 'score_desc' | 'score_asc' | 'date_desc' | 'title_asc' | 'probability_desc';
}

export interface AIRiskAnalysisResult {
  title: string;
  description: string;
  category: RiskCategory;
  probability: ProbabilityLevel;
  impact: ImpactLevel;
  score: number;
  severity: SeverityLevel;
  suggestedOwnerName: string;
  suggestedOwnerRole: string;
  mitigationPlan: string;
  contingencyPlan: string;
  aiConfidence: number;
  estimatedImpactUsd: number;
}
