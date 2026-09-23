import { RiskItem, Project, TeamMember, SeverityLevel } from '../types/risk';

export const calculateSeverity = (score: number): SeverityLevel => {
  if (score >= 20) return 'Critical';
  if (score >= 12) return 'High';
  if (score >= 6) return 'Medium';
  return 'Low';
};

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Website Redesign v2',
    code: 'WR-V2',
    description: 'Complete overhaul of enterprise marketing website, customer portal, and design system.',
    leadName: 'Sunny P. (Lead Risk Officer)',
    totalRisks: 12,
    criticalRisks: 3,
    mitigationProgress: 68,
    status: 'At Risk',
    lastUpdated: '2 hours ago'
  },
  {
    id: 'proj-2',
    name: 'SOC2 Type II Audit & Compliance',
    code: 'SOC2-AUDIT',
    description: 'Annual security compliance audit across cloud infrastructure, access control, and logging.',
    leadName: 'Elena Rostova (Compliance & Security)',
    totalRisks: 7,
    criticalRisks: 2,
    mitigationProgress: 81,
    status: 'On Track',
    lastUpdated: '1 day ago'
  },
  {
    id: 'proj-3',
    name: 'Cloud Infrastructure Revamp',
    code: 'AWS-REVAMP',
    description: 'Multi-region AWS migration, Kubernetes cluster hardening, and CI/CD pipeline optimization.',
    leadName: 'Marcus Vance (DevOps Lead)',
    totalRisks: 5,
    criticalRisks: 2,
    mitigationProgress: 54,
    status: 'At Risk',
    lastUpdated: '3 hours ago'
  }
];

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'usr-1',
    name: 'Sunny P.',
    role: 'Lead Risk Officer & PM',
    email: 'sunny@acme-cloud.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    department: 'Enterprise Core Ops',
    assignedRisksCount: 5,
    openRisksCount: 3,
    criticalRisksCount: 1,
    mitigationProgress: 75
  },
  {
    id: 'usr-2',
    name: 'Marcus Vance',
    role: 'Principal DevOps Engineer',
    email: 'm.vance@acme-cloud.io',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    department: 'Infrastructure & SecOps',
    assignedRisksCount: 6,
    openRisksCount: 4,
    criticalRisksCount: 2,
    mitigationProgress: 60
  },
  {
    id: 'usr-3',
    name: 'Yash Raj',
    role: 'Senior Backend Architect',
    email: 'y.raj@acme-cloud.io',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    department: 'Core Platform',
    assignedRisksCount: 4,
    openRisksCount: 2,
    criticalRisksCount: 2,
    mitigationProgress: 68
  },
  {
    id: 'usr-4',
    name: 'Ritika Sharma',
    role: 'Lead Product Manager',
    email: 'r.sharma@acme-cloud.io',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    department: 'Product Management',
    assignedRisksCount: 5,
    openRisksCount: 2,
    criticalRisksCount: 1,
    mitigationProgress: 82
  },
  {
    id: 'usr-5',
    name: 'David Chen',
    role: 'FinOps & Cloud Lead',
    email: 'd.chen@acme-cloud.io',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    department: 'Finance Operations',
    assignedRisksCount: 2,
    openRisksCount: 1,
    criticalRisksCount: 0,
    mitigationProgress: 90
  },
  {
    id: 'usr-6',
    name: 'Elena Rostova',
    role: 'Head of Legal & Security',
    email: 'e.rostova@acme-cloud.io',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    department: 'Legal & Governance',
    assignedRisksCount: 2,
    openRisksCount: 0,
    criticalRisksCount: 1,
    mitigationProgress: 100
  }
];

export const MOCK_RISKS: RiskItem[] = [
  {
    id: 'RSK-104',
    title: 'Payment Gateway Webhook Flakiness & Timeout Failures',
    description: 'During peak flash traffic, incoming Stripe webhook deliveries experience sporadic 504 timeouts due to heavy unindexed database locks. This creates unverified payment transactions and drops order fulfillment workflows.',
    category: 'Technical',
    probability: 4,
    impact: 5,
    score: 20,
    severity: 'Critical',
    status: 'Open',
    projectId: 'proj-1',
    projectName: 'Website Redesign v2',
    ownerId: 'usr-2',
    ownerName: 'Marcus Vance',
    ownerRole: 'Principal DevOps Engineer',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    coOwnerName: 'Yash Raj',
    coOwnerRole: 'Senior Backend Architect',
    mitigationPlan: 'Migrate webhook receiver to AWS API Gateway + SQS buffer queue to decouple synchronous order write.',
    contingencyPlan: 'Trigger automated fallback reconciliation script every 15 minutes to pull Stripe Events API directly.',
    mitigationProgress: 65,
    dueDate: '2024-11-12',
    estimatedImpactUsd: 45000,
    aiSuggested: true,
    aiConfidence: 94,
    lastUpdated: '10 min ago',
    createdAt: '2024-10-28',
    checklist: [
      { id: 'chk-1', title: 'Provision SQS-FIFO queue with dead-letter queue (DLQ)', completed: true, assignedTo: 'Marcus Vance', completedAt: 'Oct 29' },
      { id: 'chk-2', title: 'Deploy staging lambda worker to consume messages', completed: true, assignedTo: 'Yash Raj', completedAt: 'Oct 31' },
      { id: 'chk-3', title: 'Run load test with 2,000 req/sec simulated spike', completed: false, assignedTo: 'Marcus Vance' },
      { id: 'chk-4', title: 'Production rollback verification test & runbook signoff', completed: false, assignedTo: 'Marcus Vance' }
    ],
    activityLogs: [
      { id: 'act-1', timestamp: 'Today, 11:20 AM', author: 'Marcus Vance', action: 'Updated mitigation progress to 65% after staging consumer verified.', type: 'mitigation_update' },
      { id: 'act-2', timestamp: 'Yesterday, 3:45 PM', author: 'AI Copilot', action: 'Re-evaluated risk score from 25 to 20 based on staging test results.', type: 'ai_analysis' },
      { id: 'act-3', timestamp: 'Oct 28, 9:15 AM', author: 'Sunny P.', action: 'Registered new technical risk entry via AI Copilot prompt.', type: 'creation' }
    ]
  },
  {
    id: 'RSK-089',
    title: 'API Integration Delay on Stripe Connect & Enterprise Billing',
    description: 'Stripe API breaking change in billing webhooks requires custom middleware rewrite, putting Sprint 4 deployment timeline at risk.',
    category: 'Technical',
    probability: 3,
    impact: 4,
    score: 12,
    severity: 'High',
    status: 'Open',
    projectId: 'proj-1',
    projectName: 'Website Redesign v2',
    ownerId: 'usr-3',
    ownerName: 'Yash Raj',
    ownerRole: 'Senior Backend Architect',
    ownerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    mitigationPlan: 'Deploy stubbed sandbox endpoints for parallel UI frontend testing while backend team finishes middleware migration.',
    contingencyPlan: 'Postpone multi-currency checkout feature to Phase 2 release.',
    mitigationProgress: 40,
    dueDate: '2024-11-18',
    estimatedImpactUsd: 18500,
    lastUpdated: '2 hours ago',
    createdAt: '2024-10-25',
    checklist: [
      { id: 'chk-10', title: 'Create mock API server for frontend team', completed: true, assignedTo: 'Yash Raj', completedAt: 'Oct 26' },
      { id: 'chk-11', title: 'Refactor webhook signature validator', completed: false, assignedTo: 'Yash Raj' }
    ],
    activityLogs: [
      { id: 'act-10', timestamp: '2 hours ago', author: 'Yash Raj', action: 'Added mock API server to unblock frontend engineers.', type: 'mitigation_update' }
    ]
  },
  {
    id: 'RSK-072',
    title: 'Frontend Engineering Capacity Crunch in Sprint 5-6',
    description: 'Two senior frontend developers assigned to high-priority customer escalations, leaving 120 story points understaffed.',
    category: 'Resource',
    probability: 4,
    impact: 3,
    score: 12,
    severity: 'High',
    status: 'Monitoring',
    projectId: 'proj-1',
    projectName: 'Website Redesign v2',
    ownerId: 'usr-4',
    ownerName: 'Ritika Sharma',
    ownerRole: 'Lead Product Manager',
    ownerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    mitigationPlan: 'Contract 2 specialized Tailwind/Next.js engineers for sprints 14-16 via approved vendor pool.',
    contingencyPlan: 'Scope out non-essential onboarding animations and secondary dashboard widgets.',
    mitigationProgress: 80,
    dueDate: '2024-11-05',
    estimatedImpactUsd: 22000,
    lastUpdated: '4 hours ago',
    createdAt: '2024-10-20',
    checklist: [
      { id: 'chk-20', title: 'Contractor SOW signed by procurement', completed: true },
      { id: 'chk-21', title: 'Onboarding & codebase access provisioned', completed: true }
    ],
    activityLogs: [
      { id: 'act-20', timestamp: '4 hours ago', author: 'Ritika Sharma', action: 'Contractor SOW approved. Onboarding complete.', type: 'status_change' }
    ]
  },
  {
    id: 'RSK-055',
    title: 'SOC2 Type II Compliance Sign-off Delay on Data Audit Logs',
    description: 'Third-party compliance auditor raised concern regarding automated log retention policies in non-prod staging clusters.',
    category: 'Compliance',
    probability: 2,
    impact: 3,
    score: 6,
    severity: 'Medium',
    status: 'Mitigated',
    projectId: 'proj-2',
    projectName: 'SOC2 Type II Audit & Compliance',
    ownerId: 'usr-6',
    ownerName: 'Elena Rostova',
    ownerRole: 'Head of Legal & Security',
    ownerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    mitigationPlan: 'Implement CloudWatch immutable log archiving policies with 365-day retention locks across all VPC subnets.',
    contingencyPlan: 'Engage external auditor for expedited manual review track.',
    mitigationProgress: 100,
    dueDate: '2024-10-30',
    estimatedImpactUsd: 12000,
    lastUpdated: '1 day ago',
    createdAt: '2024-10-15',
    checklist: [
      { id: 'chk-30', title: 'Enable AWS S3 Glacier WORM retention locks', completed: true },
      { id: 'chk-31', title: 'Submit audit evidence pack to compliance team', completed: true }
    ],
    activityLogs: [
      { id: 'act-30', timestamp: '1 day ago', author: 'Elena Rostova', action: 'Marked risk as Mitigated following auditor approval.', type: 'status_change' }
    ]
  },
  {
    id: 'RSK-041',
    title: 'Cloud Infrastructure Cost Overrun on Kubernetes Clusters',
    description: 'Uncapped autoscaling node pools in staging sandbox environment caused a 38% budget variance for Q3 cloud expenditure.',
    category: 'Financial',
    probability: 3,
    impact: 4,
    score: 12,
    severity: 'High',
    status: 'Monitoring',
    projectId: 'proj-3',
    projectName: 'Cloud Infrastructure Revamp',
    ownerId: 'usr-5',
    ownerName: 'David Chen',
    ownerRole: 'FinOps & Cloud Lead',
    ownerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    mitigationPlan: 'Apply AWS Savings Plans, establish Karpenter autoscaler hard limits, and implement shut-down scripts for staging after 8 PM.',
    contingencyPlan: 'Reallocate 15% contingency reserve budget from Q4 operational fund.',
    mitigationProgress: 75,
    dueDate: '2024-11-20',
    estimatedImpactUsd: 34000,
    lastUpdated: '3 days ago',
    createdAt: '2024-10-12',
    checklist: [
      { id: 'chk-40', title: 'Deploy Kubecost monitor and automated slack alerting', completed: true },
      { id: 'chk-41', title: 'Set max node limit on staging node groups', completed: true }
    ],
    activityLogs: [
      { id: 'act-40', timestamp: '3 days ago', author: 'David Chen', action: 'FinOps auto-cleanup active. Budget variance reduced to <5%.', type: 'mitigation_update' }
    ]
  },
  {
    id: 'RSK-033',
    title: 'Production Deployment Rollback Failure Risk',
    description: 'Absence of automated database migration rollback scripts could cause multi-hour service downtime during blue-green deployment.',
    category: 'Technical',
    probability: 2,
    impact: 5,
    score: 10,
    severity: 'Medium',
    status: 'Mitigated',
    projectId: 'proj-3',
    projectName: 'Cloud Infrastructure Revamp',
    ownerId: 'usr-2',
    ownerName: 'Marcus Vance',
    ownerRole: 'Principal DevOps Engineer',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    mitigationPlan: 'Enforce dual-write schema migration pattern with automated canary rollback pipeline in GitHub Actions.',
    contingencyPlan: 'Maintain static database snapshot mirror 10 minutes prior to deployment window.',
    mitigationProgress: 90,
    dueDate: '2024-11-01',
    estimatedImpactUsd: 50000,
    lastUpdated: '4 days ago',
    createdAt: '2024-10-05',
    checklist: [
      { id: 'chk-50', title: 'Write down-migration scripts for Prisma Schema v4', completed: true },
      { id: 'chk-51', title: 'Test blue-green deployment canary in staging', completed: true }
    ],
    activityLogs: [
      { id: 'act-50', timestamp: '4 days ago', author: 'Marcus Vance', action: 'Canary rollback pipeline verified.', type: 'status_change' }
    ]
  },
  {
    id: 'RSK-019',
    title: 'Third-Party Auth Zero-Day Vulnerability Exposure',
    description: 'Vulnerability identified in npm auth library module requiring emergency patching and user session re-authentication.',
    category: 'Security',
    probability: 2,
    impact: 5,
    score: 10,
    severity: 'Medium',
    status: 'Closed',
    projectId: 'proj-2',
    projectName: 'SOC2 Type II Audit & Compliance',
    ownerId: 'usr-6',
    ownerName: 'Elena Rostova',
    ownerRole: 'Head of Legal & Security',
    ownerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    mitigationPlan: 'Upgrade auth library to v5.2.1-patch, invalidate stale JWT tokens, and force password reset on suspicious sessions.',
    contingencyPlan: 'Revoke compromised OAuth secrets and issue emergency customer security advisory.',
    mitigationProgress: 100,
    dueDate: '2024-10-18',
    estimatedImpactUsd: 15000,
    lastUpdated: '1 week ago',
    createdAt: '2024-09-28',
    checklist: [
      { id: 'chk-60', title: 'Patch library & run automated snyk vulnerability scan', completed: true },
      { id: 'chk-61', title: 'Flush redis session cache', completed: true }
    ],
    activityLogs: [
      { id: 'act-60', timestamp: '1 week ago', author: 'Elena Rostova', action: 'Patch verified. Closed security incident.', type: 'status_change' }
    ]
  },
  {
    id: 'RSK-012',
    title: 'Vendor API Rate Limiting on External Geocoding Engine',
    description: 'Increased traffic volume triggers vendor HTTP 429 Too Many Requests errors during checkout address verification.',
    category: 'External',
    probability: 4,
    impact: 2,
    score: 8,
    severity: 'Medium',
    status: 'Open',
    projectId: 'proj-1',
    projectName: 'Website Redesign v2',
    ownerId: 'usr-1',
    ownerName: 'Sunny P.',
    ownerRole: 'Lead Risk Officer & PM',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    mitigationPlan: 'Upgrade vendor tier to Enterprise SLA and implement client-side address caching with 24hr TTL in Redis.',
    contingencyPlan: 'Fallback to secondary open-source geocoding API endpoint.',
    mitigationProgress: 35,
    dueDate: '2024-11-25',
    estimatedImpactUsd: 8000,
    lastUpdated: '5 days ago',
    createdAt: '2024-09-20',
    checklist: [
      { id: 'chk-70', title: 'Redis cache layer deployment', completed: false }
    ],
    activityLogs: [
      { id: 'act-70', timestamp: '5 days ago', author: 'Sunny P.', action: 'Created risk item.', type: 'creation' }
    ]
  }
];
