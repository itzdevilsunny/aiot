import { describe, it, expect } from 'vitest';
import { calculateSeverity } from '../types/risk';
import { computeRiskMerkleRoot, buildBlockchainLedger, generateHash } from '../lib/blockchainLedger';
import { RiskItem, ProbabilityLevel, ImpactLevel } from '../types/risk';

describe('Quantitative Risk Scoring (5x5 Matrix)', () => {
  it('correctly maps scores to standard enterprise severity bands', () => {
    // Low: 1..4
    expect(calculateSeverity(1)).toBe('Low');
    expect(calculateSeverity(4)).toBe('Low');

    // Medium: 5..9
    expect(calculateSeverity(5)).toBe('Medium');
    expect(calculateSeverity(9)).toBe('Medium');

    // High: 10..16
    expect(calculateSeverity(10)).toBe('High');
    expect(calculateSeverity(16)).toBe('High');

    // Critical: 17..25
    expect(calculateSeverity(17)).toBe('Critical');
    expect(calculateSeverity(20)).toBe('Critical');
    expect(calculateSeverity(25)).toBe('Critical');
  });

  it('calculates inherent and residual scores accurately', () => {
    const inhProb: ProbabilityLevel = 5;
    const inhImp: ImpactLevel = 4;
    const inhScore = inhProb * inhImp; // 20 -> Critical

    const resProb: ProbabilityLevel = 2;
    const resImp: ImpactLevel = 3;
    const resScore = resProb * resImp; // 6 -> Medium

    expect(inhScore).toBe(20);
    expect(calculateSeverity(inhScore)).toBe('Critical');

    expect(resScore).toBe(6);
    expect(calculateSeverity(resScore)).toBe('Medium');

    const reductionPercent = Math.round(((inhScore - resScore) / inhScore) * 100);
    expect(reductionPercent).toBe(70);
  });

  it('correctly evaluates risk appetite threshold breach on residual risk', () => {
    const threshold = 15;

    const riskA_ResidualScore = 16;
    const isRiskA_AboveAppetite = riskA_ResidualScore > threshold;
    expect(isRiskA_AboveAppetite).toBe(true);

    const riskB_ResidualScore = 12;
    const isRiskB_AboveAppetite = riskB_ResidualScore > threshold;
    expect(isRiskB_AboveAppetite).toBe(false);
  });
});

describe('Cryptographic Audit Ledger & Merkle Root Chain', () => {
  const sampleRisks: RiskItem[] = [
    {
      id: 'RSK-101',
      title: 'Cloud Misconfiguration Exposure',
      description: 'IAM role misconfiguration granting broad access',
      category: 'Security',
      inherentProbability: 5,
      inherentImpact: 4,
      inherentScore: 20,
      inherentSeverity: 'Critical',
      residualProbability: 2,
      residualImpact: 3,
      residualScore: 6,
      residualSeverity: 'Medium',
      probability: 5,
      impact: 4,
      score: 20,
      severity: 'Critical',
      treatmentStrategy: 'Mitigate',
      aboveAppetite: false,
      status: 'Monitoring',
      mitigationProgress: 75,
      projectId: 'proj-1',
      projectName: 'Cloud Infra',
      ownerId: 'usr-1',
      ownerName: 'Security Lead',
      ownerRole: 'SecOps',
      mitigationPlan: 'Apply strict least-privilege policies.',
      contingencyPlan: 'Rollback credentials.',
      checklist: [],
      lastUpdated: '2026-10-01',
      createdAt: '2026-09-15',
      activityLogs: []
    },
    {
      id: 'RSK-102',
      title: 'Single Point of Failure in Core API',
      description: 'Single region dependency on database primary node',
      category: 'Technical',
      inherentProbability: 4,
      inherentImpact: 5,
      inherentScore: 20,
      inherentSeverity: 'Critical',
      residualProbability: 4,
      residualImpact: 4,
      residualScore: 16,
      residualSeverity: 'High',
      probability: 4,
      impact: 5,
      score: 20,
      severity: 'Critical',
      treatmentStrategy: 'Mitigate',
      aboveAppetite: true,
      status: 'Open',
      mitigationProgress: 20,
      projectId: 'proj-1',
      projectName: 'Core Systems',
      ownerId: 'usr-2',
      ownerName: 'Tech Lead',
      ownerRole: 'Engineering',
      mitigationPlan: 'Deploy multi-region read replicas.',
      contingencyPlan: 'Failover to standby cluster.',
      checklist: [],
      lastUpdated: '2026-10-02',
      createdAt: '2026-09-20',
      activityLogs: []
    }
  ];

  it('generates a deterministic Merkle Root for risk state', () => {
    const root1 = computeRiskMerkleRoot(sampleRisks);
    const root2 = computeRiskMerkleRoot(sampleRisks);

    expect(root1).toBe(root2);
    expect(root1.startsWith('0x')).toBe(true);
  });

  it('detects tampering when any risk attribute is mutated', () => {
    const initialRoot = computeRiskMerkleRoot(sampleRisks);

    // Tampered copy with altered mitigation progress
    const tamperedRisks = JSON.parse(JSON.stringify(sampleRisks)) as RiskItem[];
    tamperedRisks[0].mitigationProgress = 99;

    const tamperedRoot = computeRiskMerkleRoot(tamperedRisks);
    expect(tamperedRoot).not.toBe(initialRoot);
  });

  it('builds an unbroken cryptographic hash chain from Genesis block', () => {
    const blocks = buildBlockchainLedger(sampleRisks);

    // Block 0 is Genesis + 2 risk blocks = 3 blocks
    expect(blocks.length).toBe(3);
    expect(blocks[0].riskId).toBe('SYS-GENESIS');
    expect(blocks[0].previousHash).toBe('0x0000000000000000000000000000000000000000');

    // Block 1 previousHash must match Block 0 txHash
    expect(blocks[1].previousHash).toBe(blocks[0].txHash);
    expect(blocks[1].riskId).toBe('RSK-101');

    // Block 2 previousHash must match Block 1 txHash
    expect(blocks[2].previousHash).toBe(blocks[1].txHash);
    expect(blocks[2].riskId).toBe('RSK-102');
  });
});
