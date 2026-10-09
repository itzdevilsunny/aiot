import { 
  RiskItem, 
  Project, 
  TeamMember, 
  SeverityLevel,
  Control,
  MitigationAction,
  EvidenceRecord,
  KeyRiskIndicator,
  RiskReviewRecord,
  ApprovalRequest,
  AuditLogItem
} from '../types/risk';

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
    userRole: 'Admin',
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
    userRole: 'Risk Manager',
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
    userRole: 'Risk Owner',
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
    userRole: 'Approver',
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
    userRole: 'Auditor',
    email: 'devyash@mnbresearch.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    department: 'Data Operations',
    assignedRisksCount: 4,
    openRisksCount: 1,
    criticalRisksCount: 0,
    mitigationProgress: 90
  }
];

export const MOCK_CONTROLS: Control[] = [
  {
    id: 'CTRL-101',
    name: 'Automated OCR & Document Validation Service',
    description: 'Real-time schema validation script parsing customer identification documents upon upload.',
    category: 'Operational',
    type: 'Preventive',
    objective: 'Prevent invalid or unreadable documents from entering client onboarding pipeline.',
    ownerName: 'Yash Raj',
    ownerRole: 'Operations Lead',
    implementationStatus: 'Implemented',
    effectiveness: 'Effective',
    testStatus: 'Passed',
    lastTestDate: '2026-09-25',
    nextTestDate: '2026-10-25',
    linkedRiskIds: ['RSK-101']
  },
  {
    id: 'CTRL-102',
    name: 'Multi-Region Read-Only Database Replica',
    description: 'Secondary PostgreSQL replica configured with failover routing during batch migrations.',
    category: 'Technical',
    type: 'Corrective',
    objective: 'Ensure zero-downtime query access during high-concurrency database updates.',
    ownerName: 'Sunny Prasad',
    ownerRole: 'Business Operations Intern',
    implementationStatus: 'In Progress',
    effectiveness: 'Partially Effective',
    testStatus: 'Failed',
    lastTestDate: '2026-10-02',
    nextTestDate: '2026-10-12',
    linkedRiskIds: ['RSK-105']
  },
  {
    id: 'CTRL-103',
    name: 'Redis API Rate Limit & Exponential Backoff',
    description: 'API gateway circuit breaker limiting requests to 500 req/min per tenant.',
    category: 'Technical',
    type: 'Preventive',
    objective: 'Mitigate upstream vendor API rate-limiting during end-of-quarter audits.',
    ownerName: 'Ritika',
    ownerRole: 'Product Manager',
    implementationStatus: 'Implemented',
    effectiveness: 'Effective',
    testStatus: 'Passed',
    lastTestDate: '2026-09-28',
    nextTestDate: '2026-10-28',
    linkedRiskIds: ['RSK-102']
  },
  {
    id: 'CTRL-104',
    name: 'Cross-Training & Secondary Release Lead Assignment',
    description: 'Formal rotation policy ensuring secondary engineer is qualified to run deployment playbooks.',
    category: 'Resource',
    type: 'Detective',
    objective: 'Maintain release throughput during primary engineer PTO or emergency support duties.',
    ownerName: 'Sumit',
    ownerRole: 'Resource Manager',
    implementationStatus: 'Planned',
    effectiveness: 'Ineffective',
    testStatus: 'Pending Test',
    lastTestDate: '2026-08-15',
    nextTestDate: '2026-10-15',
    linkedRiskIds: ['RSK-103']
  }
];

export const MOCK_MITIGATION_ACTIONS: MitigationAction[] = [
  {
    id: 'ACT-101',
    riskId: 'RSK-101',
    riskTitle: 'Client Onboarding Delay',
    title: 'Deploy OCR validation middleware to staging',
    description: 'Integrate Tesseract OCR engine with fast API endpoint for instant file validation.',
    linkedControlId: 'CTRL-101',
    assignedOwnerName: 'Yash Raj',
    assignedOwnerRole: 'Operations Lead',
    priority: 'High',
    startDate: '2026-09-20',
    dueDate: '2026-10-05',
    status: 'In Progress',
    progressPct: 75,
    verificationStatus: 'Pending Verification',
    createdAt: '2026-09-20',
    lastUpdated: '2026-10-01'
  },
  {
    id: 'ACT-102',
    riskId: 'RSK-105',
    riskTitle: 'Multi-Region PostgreSQL Row Locking during Migration Window',
    title: 'Benchmark batch migration script in staging environment',
    description: 'Run 10,000 synthetic transaction updates with locks enabled to measure latency.',
    linkedControlId: 'CTRL-102',
    assignedOwnerName: 'Sunny Prasad',
    assignedOwnerRole: 'Business Operations Intern',
    priority: 'High',
    startDate: '2026-09-28',
    dueDate: '2026-10-02',
    status: 'Blocked',
    progressPct: 40,
    completionEvidence: 'Staging lock timeout logs attached.',
    verificationStatus: 'Unverified',
    createdAt: '2026-09-28',
    lastUpdated: '2026-10-02'
  },
  {
    id: 'ACT-103',
    riskId: 'RSK-102',
    riskTitle: 'Third-Party API Rate Limit Throttling',
    title: 'Configure Redis cache TTL buffer rules',
    description: 'Set 60-second TTL cache for all idempotent document synthesis response payloads.',
    linkedControlId: 'CTRL-103',
    assignedOwnerName: 'Ritika',
    assignedOwnerRole: 'Product Manager',
    priority: 'Medium',
    startDate: '2026-09-25',
    dueDate: '2026-10-10',
    status: 'Completed',
    progressPct: 100,
    completionEvidence: 'Redis benchmark report verified 99.4% cache hit rate.',
    verificationStatus: 'Verified',
    createdAt: '2026-09-25',
    lastUpdated: '2026-10-04'
  }
];

export const MOCK_EVIDENCE_RECORDS: EvidenceRecord[] = [
  {
    id: 'EVD-101',
    fileName: 'SOC2_Access_Control_Review_Q3.pdf',
    fileType: 'application/pdf',
    fileSize: 2450000,
    fileUrl: '/uploads/SOC2_Access_Control_Review_Q3.pdf',
    linkedRiskId: 'RSK-101',
    linkedControlId: 'CTRL-101',
    uploadedBy: 'Yash Raj',
    uploadTimestamp: '2026-09-26T14:30:00Z',
    description: 'Q3 privileged access review sign-off document and automated log snapshot.',
    validityExpiryDate: '2026-12-31',
    verificationStatus: 'Verified',
    verifierName: 'Devyash'
  },
  {
    id: 'EVD-102',
    fileName: 'Postgres_Replica_Failover_Test.log',
    fileType: 'text/plain',
    fileSize: 420000,
    fileUrl: '/uploads/Postgres_Replica_Failover_Test.log',
    linkedRiskId: 'RSK-105',
    linkedControlId: 'CTRL-102',
    uploadedBy: 'Sunny Prasad',
    uploadTimestamp: '2026-10-02T09:15:00Z',
    description: 'Raw console log of failover replica test showing 3.2s switchover lag.',
    validityExpiryDate: '2026-10-15',
    verificationStatus: 'Pending',
    verifierName: 'Devyash'
  },
  {
    id: 'EVD-103',
    fileName: 'API_Gateway_RateLimit_Benchmark.csv',
    fileType: 'text/csv',
    fileSize: 180000,
    fileUrl: '/uploads/API_Gateway_RateLimit_Benchmark.csv',
    linkedRiskId: 'RSK-102',
    linkedControlId: 'CTRL-103',
    uploadedBy: 'Ritika',
    uploadTimestamp: '2026-09-29T11:00:00Z',
    description: 'Load test dataset proving 1,500 req/min throughput under Redis caching.',
    validityExpiryDate: '2026-09-30',
    verificationStatus: 'Expired',
    verifierName: 'Devyash'
  }
];

export const MOCK_KRIS: KeyRiskIndicator[] = [
  {
    id: 'KRI-101',
    name: 'Privileged Access Exception Rate',
    description: 'Percentage of privileged database access requests missing prior approval ticket.',
    linkedRiskId: 'RSK-105',
    linkedRiskTitle: 'Multi-Region PostgreSQL Row Locking during Migration Window',
    linkedControlId: 'CTRL-102',
    ownerName: 'Sunny Prasad',
    measurementUnit: '% of logins',
    dataSource: 'Telemetry Script',
    currentValue: 4.8,
    warningThreshold: 2.0,
    criticalThreshold: 5.0,
    reportingFrequency: 'Daily',
    trendDirection: 'Up',
    triggerStatus: 'Warning',
    lastUpdated: '2 hours ago',
    observations: [
      { id: 'obs-1', timestamp: '2026-10-07', value: 1.2, recordedBy: 'Telemetry Script' },
      { id: 'obs-2', timestamp: '2026-10-08', value: 2.5, recordedBy: 'Telemetry Script' },
      { id: 'obs-3', timestamp: '2026-10-09', value: 4.8, recordedBy: 'Telemetry Script' }
    ]
  },
  {
    id: 'KRI-102',
    name: 'Third-Party API Latency (p99)',
    description: '99th percentile response time for external document processing endpoints.',
    linkedRiskId: 'RSK-102',
    linkedRiskTitle: 'Third-Party API Rate Limit Throttling',
    linkedControlId: 'CTRL-103',
    ownerName: 'Ritika',
    measurementUnit: 'ms',
    dataSource: 'System Metric',
    currentValue: 840,
    warningThreshold: 600,
    criticalThreshold: 1200,
    reportingFrequency: 'Daily',
    trendDirection: 'Down',
    triggerStatus: 'Warning',
    lastUpdated: '1 hour ago',
    observations: [
      { id: 'obs-4', timestamp: '2026-10-07', value: 1100, recordedBy: 'System Metric' },
      { id: 'obs-5', timestamp: '2026-10-08', value: 950, recordedBy: 'System Metric' },
      { id: 'obs-6', timestamp: '2026-10-09', value: 840, recordedBy: 'System Metric' }
    ]
  }
];

export const MOCK_REVIEWS: RiskReviewRecord[] = [
  {
    id: 'REV-101',
    riskId: 'RSK-105',
    riskTitle: 'Multi-Region PostgreSQL Row Locking during Migration Window',
    reviewDate: '2026-10-01',
    reviewerName: 'Sunny Prasad',
    reviewerRole: 'Business Operations Intern',
    previousScore: 16,
    newScore: 20,
    summary: 'Score increased due to traffic surge during month-end billing cycle.',
    findings: 'Replica lag failed latest stress test. Escalation required.',
    nextReviewDate: '2026-10-15',
    status: 'Completed'
  }
];

export const MOCK_APPROVALS: ApprovalRequest[] = [
  {
    id: 'APR-101',
    riskId: 'RSK-105',
    riskTitle: 'Multi-Region PostgreSQL Row Locking during Migration Window',
    type: 'Risk Acceptance',
    requestedBy: 'Sunny Prasad',
    approverName: 'Sumit (Resource Manager)',
    residualScore: 16,
    reason: 'Temporary acceptance requested while failover script is refactored.',
    status: 'Pending',
    expiryDate: '2026-10-31',
    createdTimestamp: '2026-10-08T16:00:00Z'
  }
];

export const MOCK_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'aud-1',
    riskId: 'RSK-105',
    actorName: 'Sunny Prasad',
    actorRole: 'Business Operations Intern',
    actionType: 'UPDATE',
    changesSummary: 'Escalated Inherent Likelihood to 5 (Score 20 - Critical). Marked Above Risk Appetite.',
    timestamp: '2026-10-09T08:30:00Z'
  },
  {
    id: 'aud-2',
    riskId: 'RSK-101',
    actorName: 'Yash Raj',
    actorRole: 'Operations Lead',
    actionType: 'INSERT',
    changesSummary: 'Created new risk record: Client Onboarding Delay. Inherent Score: 16, Residual Score: 12.',
    timestamp: '2026-10-08T11:15:00Z'
  },
  {
    id: 'aud-3',
    riskId: 'RSK-102',
    actorName: 'Ritika',
    actorRole: 'Product Manager',
    actionType: 'APPROVAL',
    changesSummary: 'Completed Redis cache action ACT-103. Residual score reduced from 20 to 12.',
    timestamp: '2026-10-07T14:20:00Z'
  }
];

export const MOCK_RISKS: RiskItem[] = [
  {
    id: 'RSK-105',
    title: 'Multi-Region PostgreSQL Row Locking during Migration Window',
    description: 'Concurrent schema updates during peak billing traffic may trigger deadlock timeouts and stall write operations across regional databases.',
    category: 'Technical',
    subcategory: 'Database Infrastructure',
    department: 'Engineering',
    affectedProcess: 'Core Payment Processing & Invoicing',

    inherentProbability: 5,
    inherentImpact: 4,
    inherentScore: 20,
    inherentSeverity: 'Critical',

    residualProbability: 4,
    residualImpact: 4,
    residualScore: 16,
    residualSeverity: 'High',

    probability: 5,
    impact: 4,
    score: 20,
    severity: 'Critical',

    treatmentStrategy: 'Mitigate',
    aboveAppetite: true,
    acceptanceStatus: 'Requested',
    reviewFrequency: 'Weekly',
    nextReviewDate: '2026-10-15',

    status: 'Open',
    projectId: 'proj-1',
    projectName: 'AI Implementation',
    ownerId: 'usr-1',
    ownerName: 'Sunny Prasad',
    ownerRole: 'Business Operations Intern',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    mitigationPlan: 'Execute database migrations in batch chunks during off-peak window (2 AM EST) with read-only replica fallback.',
    contingencyPlan: 'Automate instant point-in-time restore (PITR) within 5 minutes of deadlock detection.',
    mitigationProgress: 40,
    dueDate: '2026-10-15',
    checklist: [
      { id: 'c8', title: 'Provision read-only PostgreSQL replica', completed: true, assignedTo: 'Sunny Prasad', completedAt: '2 days ago' },
      { id: 'c9', title: 'Benchmark batch migration scripts in staging', completed: false, assignedTo: 'Sunny Prasad' }
    ],
    activityLogs: [
      { id: 'a5', timestamp: '15 min ago', author: 'Sunny Prasad', action: 'Escalated inherent severity score to 20.', type: 'status_change' }
    ],
    linkedControlIds: ['CTRL-102'],
    linkedActionIds: ['ACT-102'],
    linkedEvidenceIds: ['EVD-102'],
    aiSuggested: true,
    aiConfidence: 96,
    estimatedImpactUsd: 50000,
    lastUpdated: 'Just now',
    createdAt: '2026-09-28'
  },
  {
    id: 'RSK-101',
    title: 'Client Onboarding Documentation slips',
    description: 'Third-party compliance documentation verification delays cause slips in client onboarding schedules across enterprise accounts.',
    category: 'Schedule',
    subcategory: 'Client Governance',
    department: 'MNB Research · Business Operations',
    affectedProcess: 'Enterprise Client Onboarding',

    inherentProbability: 4,
    inherentImpact: 4,
    inherentScore: 16,
    inherentSeverity: 'High',

    residualProbability: 3,
    residualImpact: 3,
    residualScore: 9,
    residualSeverity: 'Medium',

    probability: 4,
    impact: 4,
    score: 16,
    severity: 'High',

    treatmentStrategy: 'Mitigate',
    aboveAppetite: true,
    acceptanceStatus: 'None',
    reviewFrequency: 'Monthly',
    nextReviewDate: '2026-10-25',

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
    dueDate: '2026-11-15',
    checklist: [
      { id: 'c1', title: 'Automated document OCR script deployment', completed: true, assignedTo: 'Yash Raj', completedAt: 'Yesterday' },
      { id: 'c2', title: 'SLA escalation trigger testing', completed: false, assignedTo: 'Yash Raj' }
    ],
    activityLogs: [
      { id: 'a1', timestamp: 'Today, 10:15 AM', author: 'Yash Raj', action: 'Created risk record.', type: 'creation' }
    ],
    linkedControlIds: ['CTRL-101'],
    linkedActionIds: ['ACT-101'],
    linkedEvidenceIds: ['EVD-101'],
    aiSuggested: true,
    aiConfidence: 94,
    estimatedImpactUsd: 15000,
    lastUpdated: '10 min ago',
    createdAt: '2026-09-28'
  },
  {
    id: 'RSK-102',
    title: 'Third-Party API Rate Limit Throttling',
    description: 'Upstream vendor API rate limits restrict real-time document synthesis during end-of-quarter auditing spikes.',
    category: 'Technical',
    subcategory: 'API Gateways',
    department: 'Product Strategy',
    affectedProcess: 'Document AI Synthesis',

    inherentProbability: 4,
    inherentImpact: 4,
    inherentScore: 16,
    inherentSeverity: 'High',

    residualProbability: 2,
    residualImpact: 3,
    residualScore: 6,
    residualSeverity: 'Medium',

    probability: 4,
    impact: 4,
    score: 16,
    severity: 'High',

    treatmentStrategy: 'Mitigate',
    aboveAppetite: false,
    acceptanceStatus: 'Accepted',
    reviewFrequency: 'Quarterly',
    nextReviewDate: '2026-11-30',

    status: 'Monitoring',
    projectId: 'proj-1',
    projectName: 'AI Implementation',
    ownerId: 'usr-3',
    ownerName: 'Ritika',
    ownerRole: 'Product Manager',
    ownerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    mitigationPlan: 'Implement Redis response caching and exponential backoff retry policy across API gateways.',
    contingencyPlan: 'Failover to secondary backup API key pool with automatic circuit breaker routing.',
    mitigationProgress: 75,
    dueDate: '2026-10-20',
    checklist: [
      { id: 'c3', title: 'Configure Redis cache TTL for synthesis payloads', completed: true, assignedTo: 'Ritika', completedAt: '2 days ago' }
    ],
    activityLogs: [
      { id: 'a2', timestamp: '1 hour ago', author: 'Ritika', action: 'Configured Redis cache TTL.', type: 'mitigation_update' }
    ],
    linkedControlIds: ['CTRL-103'],
    linkedActionIds: ['ACT-103'],
    linkedEvidenceIds: ['EVD-103'],
    aiSuggested: true,
    aiConfidence: 92,
    estimatedImpactUsd: 40000,
    lastUpdated: '1 hour ago',
    createdAt: '2026-09-25'
  },
  {
    id: 'RSK-103',
    title: 'Key Personnel Release Unavailability',
    description: 'Senior backend engineers assigned to high-priority customer support escalations during release week window.',
    category: 'Resource',
    subcategory: 'Team Capacity',
    department: 'Resource Allocation',
    affectedProcess: 'Release Deployment Pipeline',

    inherentProbability: 4,
    inherentImpact: 3,
    inherentScore: 12,
    inherentSeverity: 'High',

    residualProbability: 3,
    residualImpact: 3,
    residualScore: 9,
    residualSeverity: 'Medium',

    probability: 4,
    impact: 3,
    score: 12,
    severity: 'High',

    treatmentStrategy: 'Mitigate',
    aboveAppetite: false,
    acceptanceStatus: 'None',
    reviewFrequency: 'Monthly',
    nextReviewDate: '2026-11-01',

    status: 'Open',
    projectId: 'proj-3',
    projectName: 'Operations Automation',
    ownerId: 'usr-4',
    ownerName: 'Sumit',
    ownerRole: 'Resource Manager',
    ownerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    mitigationPlan: 'Reallocate specialized React/Node developers from secondary internal tooling squad.',
    contingencyPlan: 'Scope down secondary dashboard animations and optional widget features.',
    mitigationProgress: 30,
    dueDate: '2026-11-08',
    checklist: [
      { id: 'c5', title: 'Resource allocation request submitted', completed: true, assignedTo: 'Sumit' }
    ],
    activityLogs: [
      { id: 'a3', timestamp: '3 hours ago', author: 'Sumit', action: 'Requested developer reassignment.', type: 'owner_assignment' }
    ],
    linkedControlIds: ['CTRL-104'],
    aiSuggested: false,
    estimatedImpactUsd: 12000,
    lastUpdated: '3 hours ago',
    createdAt: '2026-09-20'
  }
];
