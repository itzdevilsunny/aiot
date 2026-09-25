'use client';

import React, { useState, useMemo } from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { RiskItem } from '../../types/risk';
import { Button } from '../ui/Button';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck, 
  Download, 
  Sparkles, 
  Building2, 
  Lock, 
  Activity,
  FileSpreadsheet,
  ExternalLink
} from 'lucide-react';

interface ComplianceControl {
  framework: 'ISO 31000' | 'NIST SP 800-30' | 'SOC 2 Type II' | 'GDPR';
  controlId: string;
  name: string;
  category: string;
  description: string;
  mappedCategories: string[];
}

const FRAMEWORK_CONTROLS: ComplianceControl[] = [
  {
    framework: 'ISO 31000',
    controlId: 'ISO-5.4',
    name: 'Integration & Governance Alignment',
    category: 'Governance',
    description: 'Integration of risk management processes into overall enterprise operational governance.',
    mappedCategories: ['Operational', 'Resource', 'Financial']
  },
  {
    framework: 'ISO 31000',
    controlId: 'ISO-6.4',
    name: 'Stochastic Risk Identification & Rating',
    category: 'Assessment',
    description: 'Systematic identification and quantitative scoring of likelihood and impact.',
    mappedCategories: ['Technical', 'Security', 'Compliance']
  },
  {
    framework: 'ISO 31000',
    controlId: 'ISO-6.5',
    name: 'Proactive Risk Treatment Protocol',
    category: 'Treatment',
    description: 'Formulation and execution of documented mitigation and contingency plans.',
    mappedCategories: ['Technical', 'Operational', 'Schedule']
  },
  {
    framework: 'NIST SP 800-30',
    controlId: 'NIST-RA-1',
    name: 'Threat Source & Vulnerability Analysis',
    category: 'Security',
    description: 'Identification of adversary threat sources and technical software vulnerabilities.',
    mappedCategories: ['Technical', 'Security']
  },
  {
    framework: 'NIST SP 800-30',
    controlId: 'NIST-RA-3',
    name: 'Impact & Likelihood Quantification',
    category: 'Security',
    description: 'Quantitative determination of risk magnitude on enterprise IT assets.',
    mappedCategories: ['Technical', 'Security', 'External']
  },
  {
    framework: 'SOC 2 Type II',
    controlId: 'SOC2-CC6.1',
    name: 'Logical Access & Authentication Safeguards',
    category: 'Security',
    description: 'Implementation of logical access controls to prevent unauthorized data access.',
    mappedCategories: ['Security', 'Compliance']
  },
  {
    framework: 'SOC 2 Type II',
    controlId: 'SOC2-CC8.1',
    name: 'Change Management & Release Freeze Safeguards',
    category: 'Operations',
    description: 'Formal authorization and testing procedures prior to software production release.',
    mappedCategories: ['Technical', 'Operational', 'Schedule']
  },
  {
    framework: 'GDPR',
    controlId: 'GDPR-Art32',
    name: 'Security of Personal Data Processing',
    category: 'Data Privacy',
    description: 'Technical and organizational measures to ensure data confidentiality & resilience.',
    mappedCategories: ['Compliance', 'Security']
  }
];

export const ComplianceMatrix: React.FC = () => {
  const { risks, addToast } = useRiskContext();
  const [selectedFramework, setSelectedFramework] = useState<string>('All');

  const complianceResults = useMemo(() => {
    const activeRisks = risks.filter(r => r.status !== 'Closed');

    const controlMappings = FRAMEWORK_CONTROLS.map(control => {
      // Find matching risks for this control category
      const matchingRisks = activeRisks.filter(r => control.mappedCategories.includes(r.category));
      const criticalOrHighCount = matchingRisks.filter(r => r.severity === 'Critical' || r.severity === 'High').length;
      const unmitigatedCount = matchingRisks.filter(r => r.mitigationProgress < 50).length;

      let status: 'Compliant' | 'Warning' | 'Non-Compliant' = 'Compliant';
      if (unmitigatedCount > 1 || criticalOrHighCount > 2) {
        status = 'Non-Compliant';
      } else if (unmitigatedCount > 0 || criticalOrHighCount > 0) {
        status = 'Warning';
      }

      return {
        ...control,
        mappedRiskCount: matchingRisks.length,
        criticalOrHighCount,
        unmitigatedCount,
        status,
        sampleRiskId: matchingRisks[0]?.id || 'N/A'
      };
    });

    const filteredMappings = selectedFramework === 'All' 
      ? controlMappings 
      : controlMappings.filter(c => c.framework === selectedFramework);

    const compliantCount = filteredMappings.filter(c => c.status === 'Compliant').length;
    const warningCount = filteredMappings.filter(c => c.status === 'Warning').length;
    const nonCompliantCount = filteredMappings.filter(c => c.status === 'Non-Compliant').length;
    const healthScore = Math.round((compliantCount / (filteredMappings.length || 1)) * 100);

    return {
      controlMappings: filteredMappings,
      compliantCount,
      warningCount,
      nonCompliantCount,
      healthScore
    };
  }, [risks, selectedFramework]);

  const handleExportAuditMemo = () => {
    const lines = [
      `=================================================================`,
      `ENTERPRISE COMPLIANCE AUDIT READINESS MEMO (ISO 31000 & NIST SP 800-30)`,
      `Generated: ${new Date().toISOString().split('T')[0]} | MNB Research Operations`,
      `=================================================================\n`,
      `OVERVIEW HEALTH SCORE: ${complianceResults.healthScore}%`,
      `Compliant Controls: ${complianceResults.compliantCount}`,
      `Warning Controls: ${complianceResults.warningCount}`,
      `Deficient / Non-Compliant Controls: ${complianceResults.nonCompliantCount}\n`,
      `DETAILED CONTROL COMPLIANCE MAPPING:`,
      `-----------------------------------------------------------------`
    ];

    complianceResults.controlMappings.forEach(c => {
      lines.push(`[${c.framework}] ${c.controlId}: ${c.name}`);
      lines.push(`  Status: ${c.status.toUpperCase()} | Associated Risks: ${c.mappedRiskCount} | Unmitigated: ${c.unmitigatedCount}`);
      lines.push(`  Description: ${c.description}`);
      lines.push(`-----------------------------------------------------------------`);
    });

    const textContent = lines.join('\n');
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Audit_Compliance_Readiness_Memo_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Audit Memo Downloaded', 'Exported ISO 31000 & NIST SP 800-30 audit readiness memo.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Enterprise Compliance & Governance Control Matrix
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated alignment of live register threats against <strong>ISO 31000</strong>, <strong>NIST SP 800-30</strong>, and <strong>SOC 2 Type II</strong> control frameworks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<FileCheck className="w-3.5 h-3.5 text-indigo-600" />}
            onClick={handleExportAuditMemo}
          >
            Export Audit Memo (.TXT)
          </Button>
        </div>
      </div>

      {/* Top Health Gauge Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Compliance Health</span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{complianceResults.healthScore}%</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Audit Readiness Rating
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Compliant Controls</span>
          <div className="text-2xl font-black text-emerald-950 mt-1 font-mono">{complianceResults.compliantCount}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Fully aligned & mitigated</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Warning Level</span>
          <div className="text-2xl font-black text-amber-950 mt-1 font-mono">{complianceResults.warningCount}</div>
          <span className="text-[11px] text-amber-600 font-medium">Partial mitigation active</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Deficient / Action Needed</span>
          <div className="text-2xl font-black text-red-950 mt-1 font-mono">{complianceResults.nonCompliantCount}</div>
          <span className="text-[11px] text-red-600 font-medium">Requires immediate controls</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {['All', 'ISO 31000', 'NIST SP 800-30', 'SOC 2 Type II', 'GDPR'].map(fw => (
          <button
            key={fw}
            onClick={() => setSelectedFramework(fw)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              selectedFramework === fw
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {fw}
          </button>
        ))}
      </div>

      {/* Compliance Mapping Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Regulatory Control Mapping Table ({complianceResults.controlMappings.length} Controls)
          </h3>
          <span className="text-[11px] text-indigo-600 font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> ISO & NIST Standards
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-3">Framework</th>
                <th className="p-3">Control ID & Title</th>
                <th className="p-3">Description</th>
                <th className="p-3 text-center">Active Risks</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {complianceResults.controlMappings.map((c) => (
                <tr key={c.controlId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 whitespace-nowrap font-bold text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px]">
                      {c.framework}
                    </span>
                  </td>
                  <td className="p-3 max-w-xs">
                    <div className="font-mono text-[10px] font-bold text-slate-400">{c.controlId}</div>
                    <div className="font-bold text-slate-900">{c.name}</div>
                  </td>
                  <td className="p-3 text-slate-600 text-[11px] leading-relaxed max-w-sm">
                    {c.description}
                  </td>
                  <td className="p-3 text-center font-mono font-extrabold text-slate-800">
                    {c.mappedRiskCount}
                  </td>
                  <td className="p-3 text-center whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      c.status === 'Compliant' ? 'bg-emerald-100 text-emerald-800' :
                      c.status === 'Warning' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
