import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/client';

export async function POST() {
  try {
    const supabase = createClient();

    const mnbRisks = [
      {
        id: 'RSK-101',
        title: 'LLM Fine-Tuning Compute Cluster Allocation Constraint',
        description: 'GPU cluster availability constraints in the primary cloud region could delay MNB Research generative model fine-tuning milestone by 14 days.',
        category: 'Resource',
        probability: 4,
        impact: 4,
        score: 16,
        severity: 'High',
        status: 'Open',
        project_id: 'proj-1',
        project_name: 'AI Implementation',
        owner_id: 'usr-1',
        owner_name: 'Sunny Prasad',
        owner_role: 'Business Operations Intern',
        owner_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sunny',
        mitigation_plan: 'Reserve spot instance fallback pools across secondary availability zones and request GPU quota increase.',
        contingency_plan: 'Shift non-critical model evaluations to quantization pipelines to reduce raw FLOPS requirement.',
        mitigation_progress: 55,
        due_date: '2024-11-15',
        checklist: [
          { id: 'c1', title: 'AWS EC2 P4d GPU quota extension request', completed: true },
          { id: 'c2', title: 'Setup spot instance auto-recovery scripts', completed: false }
        ],
        activity_logs: [
          { id: 'a1', timestamp: 'Today, 9:30 AM', author: 'Sunny Prasad', action: 'Seeded operational risk to Supabase DB.', type: 'creation' }
        ],
        ai_suggested: true,
        ai_confidence: 96,
        estimated_impact_usd: 24000,
        last_updated: 'Just now'
      },
      {
        id: 'RSK-102',
        title: 'Vector Database Index Drift & Query Latency Spike',
        description: 'High-dimensional embeddings insertion volume causing query latency spikes (>450ms) during peak analytical workload execution.',
        category: 'Technical',
        probability: 3,
        impact: 5,
        score: 15,
        severity: 'High',
        status: 'Monitoring',
        project_id: 'proj-1',
        project_name: 'AI Implementation',
        owner_id: 'usr-3',
        owner_name: 'Ritika',
        owner_role: 'Product Manager',
        owner_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ritika',
        mitigation_plan: 'Implement HNSW index partitioning and deploy Redis read-replica cache for top-K search queries.',
        contingency_plan: 'Fallback to flat index search mode during burst index maintenance windows.',
        mitigation_progress: 70,
        due_date: '2024-11-20',
        checklist: [
          { id: 'c3', title: 'HNSW index partitioning deployment', completed: true },
          { id: 'c4', title: 'Redis vector cache layer setup', completed: true }
        ],
        activity_logs: [
          { id: 'a2', timestamp: '1 hour ago', author: 'Ritika', action: 'Verified Redis cache layer performance.', type: 'mitigation_update' }
        ],
        ai_suggested: true,
        ai_confidence: 94,
        estimated_impact_usd: 18500,
        last_updated: '1 hour ago'
      },
      {
        id: 'RSK-103',
        title: 'SOC2 Type II Audit Log Retention Compliance Gap',
        description: 'Automated log archiving policies in non-prod staging clusters require immutable retention locks to satisfy MNB Research SOC2 audit criteria.',
        category: 'Compliance',
        probability: 2,
        impact: 4,
        score: 8,
        severity: 'Medium',
        status: 'Mitigated',
        project_id: 'proj-3',
        project_name: 'Operations Automation',
        owner_id: 'usr-5',
        owner_name: 'Devyash',
        owner_role: 'Data Quality Analyst',
        owner_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Devyash',
        mitigation_plan: 'Enforce AWS S3 Object Lock in compliance mode with 365-day retention policies across all VPC subnets.',
        contingency_plan: 'Engage external compliance auditor for preliminary memo sign-off.',
        mitigation_progress: 100,
        due_date: '2024-10-31',
        checklist: [
          { id: 'c5', title: 'S3 Object Lock compliance policy active', completed: true }
        ],
        activity_logs: [
          { id: 'a3', timestamp: '1 day ago', author: 'Devyash', action: 'Auditor approved retention policy.', type: 'status_change' }
        ],
        ai_suggested: false,
        estimated_impact_usd: 12000,
        last_updated: '1 day ago'
      },
      {
        id: 'RSK-104',
        title: 'Third-Party Vendor API Rate Limiting on External Embeddings',
        description: 'HTTP 429 rate limit errors encountered during batch text embedding generation for enterprise client onboarding files.',
        category: 'External',
        probability: 4,
        impact: 3,
        score: 12,
        severity: 'High',
        status: 'Open',
        project_id: 'proj-2',
        project_name: 'Client Onboarding',
        owner_id: 'usr-2',
        owner_name: 'Yash Raj',
        owner_role: 'Operations Lead',
        owner_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yash',
        mitigation_plan: 'Implement exponential backoff queue with jitter and request enterprise tier throughput SLA.',
        contingency_plan: 'Route batch embedding traffic to secondary open-source model endpoint.',
        mitigation_progress: 40,
        due_date: '2024-11-25',
        checklist: [
          { id: 'c6', title: 'Exponential backoff queue implementation', completed: true }
        ],
        activity_logs: [
          { id: 'a4', timestamp: '2 hours ago', author: 'Yash Raj', action: 'Updated queue logic.', type: 'mitigation_update' }
        ],
        ai_suggested: true,
        ai_confidence: 92,
        estimated_impact_usd: 15000,
        last_updated: '2 hours ago'
      },
      {
        id: 'RSK-105',
        title: 'Multi-Region PostgreSQL Database Deadlock Escalation',
        description: 'Unindexed row-level locks during concurrent batch writes causing transaction aborts in analytics database.',
        category: 'Technical',
        probability: 5,
        impact: 4,
        score: 20,
        severity: 'Critical',
        status: 'Open',
        project_id: 'proj-1',
        project_name: 'AI Implementation',
        owner_id: 'usr-1',
        owner_name: 'Sunny Prasad',
        owner_role: 'Business Operations Intern',
        owner_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sunny',
        mitigation_plan: 'Apply partial b-tree indexes on transactional foreign keys and isolate read-replica query traffic.',
        contingency_plan: 'Trigger automatic transaction isolation downgrade to READ COMMITTED during flash traffic spikes.',
        mitigation_progress: 60,
        due_date: '2024-11-05',
        checklist: [
          { id: 'c7', title: 'Index creation on foreign key columns', completed: true },
          { id: 'c8', title: 'Read-replica query offloading verification', completed: false }
        ],
        activity_logs: [
          { id: 'a5', timestamp: '15 min ago', author: 'Sunny Prasad', action: 'Escalated severity score to 20.', type: 'ai_analysis' }
        ],
        ai_suggested: true,
        ai_confidence: 97,
        estimated_impact_usd: 35000,
        last_updated: '15 min ago'
      }
    ];

    const { data, error } = await supabase.from('risks').upsert(mnbRisks);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: mnbRisks.length, message: 'Seeded real MNB Research risk records to Supabase Cloud.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to seed Supabase DB' }, { status: 500 });
  }
}
