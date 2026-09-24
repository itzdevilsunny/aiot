import { RiskItem, RiskCategory, ProbabilityLevel, ImpactLevel, StatusLevel } from '../types/risk';

/**
 * Converts array of RiskItems into an enterprise ISO/RFC4180 compliant CSV file and triggers download
 */
export function exportRisksToCSV(risks: RiskItem[], filename = 'risk_register_export.csv') {
  if (!risks || risks.length === 0) return;

  const headers = [
    'Risk ID',
    'Title',
    'Category',
    'Severity',
    'Status',
    'Score',
    'Probability (1-5)',
    'Impact (1-5)',
    'Owner Name',
    'Owner Role',
    'Project Name',
    'Estimated Impact (USD)',
    'Mitigation Progress (%)',
    'Mitigation Plan',
    'Contingency Plan',
    'Created Date'
  ];

  const rows = risks.map(r => [
    r.id,
    `"${(r.title || '').replace(/"/g, '""')}"`,
    r.category,
    r.severity,
    r.status,
    r.score,
    r.probability,
    r.impact,
    `"${(r.ownerName || '').replace(/"/g, '""')}"`,
    `"${(r.ownerRole || '').replace(/"/g, '""')}"`,
    `"${(r.projectName || '').replace(/"/g, '""')}"`,
    r.estimatedImpactUsd || (r.score * 2500),
    r.mitigationProgress || 0,
    `"${(r.mitigationPlan || '').replace(/"/g, '""')}"`,
    `"${(r.contingencyPlan || '').replace(/"/g, '""')}"`,
    r.createdAt
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(e => e.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parses raw CSV text into array of RiskItem payloads for bulk import
 */
export function parseCSVToRisks(csvText: string): Partial<RiskItem>[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const importedRisks: Partial<RiskItem>[] = [];

  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Split by comma ignoring commas inside quotes
    const cols = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');

    if (cols.length >= 2) {
      const clean = (val: string) => (val || '').replace(/^"|"$/g, '').trim();

      const title = clean(cols[1] || cols[0]);
      if (!title) continue;

      const category = (clean(cols[2]) || 'Operational') as RiskCategory;
      const prob = Math.min(5, Math.max(1, parseInt(clean(cols[6])) || 3)) as ProbabilityLevel;
      const imp = Math.min(5, Math.max(1, parseInt(clean(cols[7])) || 3)) as ImpactLevel;
      const ownerName = clean(cols[8]) || 'Sunny Prasad';

      importedRisks.push({
        title,
        description: `Bulk imported risk record: ${title}`,
        category,
        probability: prob,
        impact: imp,
        status: (clean(cols[4]) || 'Open') as StatusLevel,
        ownerName,
        ownerRole: clean(cols[9]) || 'Risk Assessor',
        projectName: clean(cols[10]) || 'Project Alpha',
        mitigationPlan: clean(cols[13]) || 'Formulate mitigation safeguards and establish monitoring thresholds.',
        contingencyPlan: clean(cols[14]) || 'Activate standby backup protocol.',
        estimatedImpactUsd: parseFloat(clean(cols[11])) || (prob * imp * 2500),
        mitigationProgress: parseInt(clean(cols[12])) || 0
      });
    }
  }

  return importedRisks;
}
