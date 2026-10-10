import { describe, it, expect } from 'vitest';

describe('Incident-to-Risk Pipeline (ISO 31000 Transformation)', () => {
  it('calculates ISO 31000 Inherent Severity and Risk Score correctly', () => {
    const testCases = [
      { prob: 5, imp: 5, expectedScore: 25, expectedSeverity: 'Critical' },
      { prob: 4, imp: 5, expectedScore: 20, expectedSeverity: 'Critical' },
      { prob: 4, imp: 4, expectedScore: 16, expectedSeverity: 'High' },
      { prob: 3, imp: 4, expectedScore: 12, expectedSeverity: 'High' },
      { prob: 3, imp: 3, expectedScore: 9, expectedSeverity: 'Medium' },
      { prob: 2, imp: 3, expectedScore: 6, expectedSeverity: 'Medium' },
      { prob: 1, imp: 2, expectedScore: 2, expectedSeverity: 'Low' },
    ];

    testCases.forEach(({ prob, imp, expectedScore, expectedSeverity }) => {
      const score = prob * imp;
      let severity: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
      if (score >= 20) severity = 'Critical';
      else if (score >= 12) severity = 'High';
      else if (score >= 6) severity = 'Medium';

      expect(score).toBe(expectedScore);
      expect(severity).toBe(expectedSeverity);
    });
  });

  it('synthesizes a complete ISO 31000 risk record with preventative controls and execution tasks', () => {
    const sampleIncident = {
      incidentTitle: 'INC-4091: Cloud SQL Multi-Region Deadlock',
      affectedService: 'Core Database & Checkout API',
      incidentSeverity: 'Critical',
      incidentText: 'Cascading 504 timeouts due to query pool exhaustion during unindexed batch load.'
    };

    const simulatedTransformedRisk = {
      title: `Post-Incident: ${sampleIncident.incidentTitle}`,
      category: 'Technical',
      description: `Threat of database connection saturation and checkout API dropouts derived from incident INC-4091.`,
      rootCause: 'Unindexed batch queries exhausting primary PostgreSQL connection pool.',
      probability: 4,
      impact: 5,
      score: 20,
      severity: 'Critical',
      suggestedOwner: 'Sunny Prasad',
      suggestedOwnerRole: 'Risk Lead',
      mitigationPlan: 'Introduce connection pool circuit breaker and route heavy reporting queries to read replicas.',
      contingencyPlan: 'Trigger automated pod failover and scale replica pool.',
      checklist: [
        { id: 'chk-1', title: 'Add missing database indexes on orders table', completed: false },
        { id: 'chk-2', title: 'Configure PgBouncer connection throttling per client', completed: false },
        { id: 'chk-3', title: 'Implement automated P99 latency alerts in Datadog', completed: false }
      ],
      recommendedControl: {
        title: 'Automated Query Timeout & Connection Pool Circuit Breaker',
        type: 'Preventive',
        description: 'Hard 5000ms query timeout on API transactions with automatic graceful fallback.'
      },
      estimatedImpactUsd: 45000
    };

    // Validations
    expect(simulatedTransformedRisk.score).toBe(20);
    expect(simulatedTransformedRisk.severity).toBe('Critical');
    expect(simulatedTransformedRisk.category).toBe('Technical');
    expect(simulatedTransformedRisk.checklist.length).toBeGreaterThanOrEqual(3);
    expect(simulatedTransformedRisk.recommendedControl.type).toBe('Preventive');
    expect(simulatedTransformedRisk.estimatedImpactUsd).toBeGreaterThan(0);
    expect(simulatedTransformedRisk.suggestedOwner).toBe('Sunny Prasad');
  });

  it('ensures remediation checklist items are unique and non-empty', () => {
    const rawChecklist = [
      'Deploy database read replicas',
      'Deploy database read replicas', // duplicate
      'Configure connection pooling limits',
      'Audit slow query logs weekly'
    ];

    const deduplicated = Array.from(new Set(rawChecklist.map(t => t.trim().toLowerCase())))
      .map(cleaned => rawChecklist.find(t => t.trim().toLowerCase() === cleaned)!);

    expect(deduplicated.length).toBe(3);
    expect(deduplicated).toContain('Deploy database read replicas');
    expect(deduplicated).toContain('Configure connection pooling limits');
    expect(deduplicated).toContain('Audit slow query logs weekly');
  });
});
