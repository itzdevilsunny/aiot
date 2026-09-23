import { RiskItem, Project, TeamMember, SeverityLevel } from '../types/risk';

export const calculateSeverity = (score: number): SeverityLevel => {
  if (score >= 17) return 'Critical';
  if (score >= 10) return 'High';
  if (score >= 5) return 'Medium';
  return 'Low';
};

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'AI Implementation',
    code: 'AI-IMP',
    description: 'Enterprise generative AI copilot integration for automated document analysis and risk synthesis.',
    leadName: 'Sunny Prasad (Business Operations Intern)',
    totalRisks: 24,
    criticalRisks: 3,
    mitigationProgress: 68,
    status: 'At Risk',
    lastUpdated: '10 min ago'
  },
  {
    id: 'proj-2',
    name: 'Client Onboarding',
    code: 'CL-ONB',
    description: 'Standardization of enterprise client onboarding workflow and automated SLA verification.',
    leadName: 'Yash Raj (Operations Lead)',
    totalRisks: 12,
    criticalRisks: 2,
    mitigationProgress: 81,
    status: 'On Track',
    lastUpdated: '1 hour ago'
  },
  {
    id: 'proj-3',
    name: 'Operations Automation',
    code: 'OPS-AUTO',
    description: 'Internal business process automation for cross-departmental compliance auditing.',
    leadName: 'Ritika (Product Manager)',
    totalRisks: 18,
    criticalRisks: 4,
    mitigationProgress: 54,
    status: 'At Risk',
    lastUpdated: '3 hours ago'
  }
];

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'usr-1',
    name: 'Sunny Prasad',
    role: 'Business Operations Intern',
    email: 'sunny.prasad@mnbresearch.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    department: 'MNB Research · Business Operations',
    assignedRisksCount: 6,
    openRisksCount: 3,
    criticalRisksCount: 1,
    mitigationProgress: 78
  },
  {
    id: 'usr-2',
    name: 'Yash Raj',
    role: 'Operations Lead',
    email: 'yash.raj@mnbresearch.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    department: 'Business Operations',
    assignedRisksCount: 5,
    openRisksCount: 3,
    criticalRisksCount: 1,
    mitigationProgress: 65
  },
  {
    id: 'usr-3',
    name: 'Ritika',
    role: 'Product Manager',
    email: 'ritika@mnbresearch.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    department: 'Product Strategy',
    assignedRisksCount: 5,
    openRisksCount: 2,
    criticalRisksCount: 1,
    mitigationProgress: 82
  },
  {
    id: 'usr-4',
    name: 'Sumit',
    role: 'Resource Manager',
    email: 'sumit@mnbresearch.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    department: 'Resource Allocation',
    assignedRisksCount: 4,
    openRisksCount: 2,
    criticalRisksCount: 1,
    mitigationProgress: 70
  },
  {
    id: 'usr-5',
    name: 'Devyash',
    role: 'Data Quality Analyst',
    email: 'devyash@mnbresearch.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    department: 'Data Operations',
    assignedRisksCount: 4,
    openRisksCount: 1,
    criticalRisksCount: 0,
    mitigationProgress: 90
  }
];

export const MOCK_RISKS: RiskItem[] = [
  {
    id: 'RSK-101',
    title: 'Client Onboarding Delay',
    description: 'Third-party documentation verification delays could cause a 2-week slip in client onboarding schedules across enterprise accounts.',
    category: 'Schedule',
    probability: 4,
    impact: 4,
    score: 16,
    severity: 'High',
    status: 'Open',
    projectId: 'proj-2',
    projectName: 'Client Onboarding',
    ownerId: 'usr-2',
    ownerName: 'Yash Raj',
    ownerRole: 'Operations Lead',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    mitigationPlan: 'Deploy automated document extraction validation tool and assign dedicated onboarding coordinator.',
    contingencyPlan: 'Fast-track manual compliance review for priority enterprise tier accounts.',
    mitigationProgress: 45,
    dueDate: '2024-11-15',
    estimatedImpactUsd: 15000,
    aiSuggested: true,
    aiConfidence: 94,
    lastUpdated: '10 min ago',
    createdAt: '2024-10-28',
    checklist: [
      { id: 'c1', title: 'Automated document OCR script deployment', completed: true, assignedTo: 'Yash Raj' },
      { id: 'c2', title: 'SLA escalation trigger testing', completed: false, assignedTo: 'Yash Raj' }
    ],
    activityLogs: [
      { id: 'a1', timestamp: 'Today, 10:15 AM', author: 'Yash Raj', action: 'Created risk record.', type: 'creation' }
    ]
  },
  {
    id: 'RSK-102',
    title: 'API Integration Dependency',
    description: 'External payment gateway API version deprecation requires middleware refactoring before Q4 release window.',
    category: 'Technical',
    probability: 3,
    impact: 5,
    score: 15,
    severity: 'High',
    status: 'Monitoring',
    projectId: 'proj-1',
    projectName: 'AI Implementation',
    ownerId: 'usr-3',
    ownerName: 'Ritika',
    ownerRole: 'Product Manager',
    ownerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    mitigationPlan: 'Deploy stubbed sandbox endpoints for parallel UI testing while backend finishes middleware migration.',
    contingencyPlan: 'Postpone multi-currency checkout module to Sprint 6 release.',
    mitigationProgress: 60,
    dueDate: '2024-11-20',
    estimatedImpactUsd: 28000,
    aiSuggested: true,
    aiConfidence: 96,
    lastUpdated: '1 hour ago',
    createdAt: '2024-10-25',
    checklist: [
      { id: 'c3', title: 'Mock sandbox server creation', completed: true, assignedTo: 'Ritika' },
      { id: 'c4', title: 'API Gateway buffer queue provision', completed: false, assignedTo: 'Ritika' }
    ],
    activityLogs: [
      { id: 'a2', timestamp: '1 hour ago', author: 'Ritika', action: 'Updated mitigation progress to 60%.', type: 'mitigation_update' }
    ]
  },
  {
    id: 'RSK-103',
    title: 'Resource Availability',
    description: 'Two senior backend engineers assigned to high-priority customer support escalations during release week.',
    category: 'Resource',
    probability: 4,
    impact: 3,
    score: 12,
    severity: 'High',
    status: 'Open',
    projectId: 'proj-3',
    projectName: 'Operations Automation',
    ownerId: 'usr-4',
    ownerName: 'Sumit',
    ownerRole: 'Resource Manager',
    ownerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    mitigationPlan: 'Reallocate 2 specialized React/Node developers from secondary internal tooling squad.',
    contingencyPlan: 'Scope down secondary dashboard animations and optional widget features.',
    mitigationProgress: 30,
    dueDate: '2024-11-08',
    estimatedImpactUsd: 12000,
    aiSuggested: false,
    lastUpdated: '3 hours ago',
    createdAt: '2024-10-20',
    checklist: [
      { id: 'c5', title: 'Resource allocation request submitted', completed: true, assignedTo: 'Sumit' }
    ],
    activityLogs: [
      { id: 'a3', timestamp: '3 hours ago', author: 'Sumit', action: 'Requested developer reassignment.', type: 'owner_assignment' }
    ]
  },
  {
    id: 'RSK-104',
    title: 'Data Validation Issue',
    description: 'Inconsistent data formatting in legacy CSV imports creates null values in executive reporting dashboards.',
    category: 'Operational',
    probability: 2,
    impact: 4,
    score: 8,
    severity: 'Medium',
    status: 'Mitigated',
    projectId: 'proj-3',
    projectName: 'Operations Automation',
    ownerId: 'usr-5',
    ownerName: 'Devyash',
    ownerRole: 'Data Quality Analyst',
    ownerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    mitigationPlan: 'Implement automated schema validation middleware and error logging pipeline prior to DB insert.',
    contingencyPlan: 'Trigger manual data sanitation script for anomalous batch uploads.',
    mitigationProgress: 95,
    dueDate: '2024-10-31',
    estimatedImpactUsd: 8500,
    aiSuggested: true,
    aiConfidence: 91,
    lastUpdated: '1 day ago',
    createdAt: '2024-10-15',
    checklist: [
      { id: 'c6', title: 'Data validation rules written', completed: true, assignedTo: 'Devyash' },
      { id: 'c7', title: 'Automated sanitization pipeline active', completed: true, assignedTo: 'Devyash' }
    ],
    activityLogs: [
      { id: 'a4', timestamp: '1 day ago', author: 'Devyash', action: 'Marked risk as Mitigated after validation tests passed.', type: 'status_change' }
    ]
  },
  {
    id: 'RSK-105',
    title: 'Critical Deployment Pipeline Timeout',
    description: 'CI/CD runner script timeouts during Docker image build causing 4-hour delay in staging environment deployment.',
    category: 'Technical',
    probability: 5,
    impact: 4,
    score: 20,
    severity: 'Critical',
    status: 'Open',
    projectId: 'proj-1',
    projectName: 'AI Implementation',
    ownerId: 'usr-1',
    ownerName: 'Sunny Prasad',
    ownerRole: 'Business Operations Intern',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    mitigationPlan: 'Upgrade GitHub Actions runner instance size and cache node_modules layer.',
    contingencyPlan: 'Manual fallback deployment script executed via CLI.',
    mitigationProgress: 50,
    dueDate: '2024-11-05',
    estimatedImpactUsd: 35000,
    aiSuggested: true,
    aiConfidence: 97,
    lastUpdated: '15 min ago',
    createdAt: '2024-10-27',
    checklist: [
      { id: 'c8', title: 'Build layer caching configured', completed: true, assignedTo: 'Sunny Prasad' }
    ],
    activityLogs: [
      { id: 'a5', timestamp: '15 min ago', author: 'Sunny Prasad', action: 'Escalated severity score to 20.', type: 'ai_analysis' }
    ]
  }
];
