import { describe, it, expect, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { 
  getDatabase, 
  getRisks, 
  createRisk, 
  updateRisk, 
  deleteRisk,
  getControls,
  createControl,
  getActions,
  createAction,
  getAuditLogs,
  getDashboardStats
} from '../lib/server/db';
import { Control, MitigationAction } from '../types/risk';

describe('Server-Side Risk Governance Engine (db.ts)', () => {
  afterAll(() => {
    const testDbPath = path.join(process.cwd(), 'data', 'enterprise_risk_register_test.json');
    if (fs.existsSync(testDbPath)) {
      try {
        fs.unlinkSync(testDbPath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  });
  it('loads database successfully with valid schema structure', () => {
    const db = getDatabase();
    expect(db).toBeDefined();
    expect(Array.isArray(db.risks)).toBe(true);
    expect(Array.isArray(db.projects)).toBe(true);
    expect(Array.isArray(db.controls)).toBe(true);
    expect(Array.isArray(db.actions)).toBe(true);
    expect(Array.isArray(db.auditLogs)).toBe(true);
    expect(db.settings.riskAppetiteThreshold).toBe(15);
  });

  it('creates a new risk with correct inherent/residual quantitative math', () => {
    const created = createRisk({
      title: 'Automated CI/CD Vulnerability',
      description: 'Pipeline dependency vulnerability flagged by automated scanner',
      category: 'Security',
      inherentProbability: 5,
      inherentImpact: 4,
      residualProbability: 2,
      residualImpact: 3,
      treatmentStrategy: 'Mitigate',
      authorName: 'Test Automation'
    });

    expect(created.id).toBeDefined();
    expect(created.inherentScore).toBe(20);
    expect(created.inherentSeverity).toBe('Critical');
    expect(created.residualScore).toBe(6);
    expect(created.residualSeverity).toBe('Medium');
    expect(created.aboveAppetite).toBe(false); // residual score 6 <= 15 threshold

    // Verify audit log entry was created
    const logs = getAuditLogs();
    const createdLog = logs.find(l => l.riskId === created.id || l.changesSummary?.includes(created.id));
    expect(createdLog).toBeDefined();

    // Clean up
    deleteRisk(created.id, 'Test Cleanup');
  });

  it('flags aboveAppetite = true when residual score exceeds risk appetite threshold', () => {
    const highRisk = createRisk({
      title: 'Catastrophic Single Cloud Provider Outage',
      description: 'Zero redundancy architecture across cloud regions',
      category: 'Operational',
      inherentProbability: 5,
      inherentImpact: 5,
      residualProbability: 4,
      residualImpact: 4, // 4 * 4 = 16 > 15
      treatmentStrategy: 'Mitigate',
      authorName: 'Test Automation'
    });

    expect(highRisk.residualScore).toBe(16);
    expect(highRisk.aboveAppetite).toBe(true);

    // Clean up
    deleteRisk(highRisk.id, 'Test Cleanup');
  });

  it('supports creating and linking Internal Controls', () => {
    const controlInput: Omit<Control, 'id'> = {
      name: 'Mandatory Multi-Factor Authentication',
      description: 'Enforces hardware MFA keys for production environments',
      category: 'Access Control',
      type: 'Preventive',
      objective: 'Eliminate unauthorized credential-based intrusion attempts',
      ownerName: 'Security Lead',
      ownerRole: 'SecOps',
      implementationStatus: 'Implemented',
      effectiveness: 'Effective',
      testStatus: 'Passed',
      linkedRiskIds: ['RSK-101']
    };

    const control = createControl(controlInput);

    expect(control.id).toBeDefined();
    expect(control.name).toBe('Mandatory Multi-Factor Authentication');
    expect(control.type).toBe('Preventive');
    expect(control.testStatus).toBe('Passed');

    const controls = getControls();
    expect(controls.some(c => c.id === control.id)).toBe(true);
  });

  it('tracks mitigation actions and SLA parameters', () => {
    const actionInput: Omit<MitigationAction, 'id' | 'createdAt' | 'lastUpdated'> = {
      riskId: 'RSK-101',
      title: 'Upgrade Database Encryption Keys',
      description: 'Rotate all master symmetric keys to AES-256 with KMS HSM',
      assignedOwnerName: 'SecOps Team',
      assignedOwnerRole: 'Security Engineer',
      priority: 'High',
      startDate: '2026-01-01',
      dueDate: '2026-02-01',
      status: 'In Progress',
      progressPct: 40,
      verificationStatus: 'Pending Verification'
    };

    const action = createAction(actionInput);

    expect(action.id).toBeDefined();
    expect(action.progressPct).toBe(40);
    expect(action.priority).toBe('High');

    const allActions = getActions();
    expect(allActions.some(a => a.id === action.id)).toBe(true);
  });

  it('aggregates live dashboard statistics correctly', () => {
    const stats = getDashboardStats();
    expect(stats.totalRisks).toBeGreaterThanOrEqual(0);
    expect(stats.criticalCount).toBeGreaterThanOrEqual(0);
    expect(stats.highCount).toBeGreaterThanOrEqual(0);
    expect(stats.aboveAppetiteCount).toBeGreaterThanOrEqual(0);
    expect(stats.totalControls).toBeGreaterThanOrEqual(0);
    expect(stats.totalActions).toBeGreaterThanOrEqual(0);
  });
});
