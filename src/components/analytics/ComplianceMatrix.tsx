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
  Search,
  Filter,
  ExternalLink,
  ChevronRight,
  Shield,
  Activity,
  FileSpreadsheet,
  Award,
  Layers,
  TrendingUp,
  Plus
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { SoAExportModal } from '../compliance/SoAExportModal';
import { ControlDetailModal, ComplianceControl } from '../compliance/ControlDetailModal';
import { AIComplianceAuditModal } from '../compliance/AIComplianceAuditModal';
import { ComplianceCertificateModal } from '../compliance/ComplianceCertificateModal';
import { CustomControlModal } from '../compliance/CustomControlModal';

const INITIAL_CONTROLS: ComplianceControl[] = [
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
    framework: 'SOC 2 Type II',
    controlId: 'SOC2-CC7.1',
    name: 'Vulnerability Detection & System Monitoring',
    category: 'Operations',
    description: 'Infrastructure vulnerability scanning and security event detection telemetry.',
    mappedCategories: ['Technical', 'Security']
  },
  {
    framework: 'GDPR',
    controlId: 'GDPR-Art32',
    name: 'Security of Personal Data Processing',
    category: 'Data Privacy',
    description: 'Technical and organizational measures to ensure data confidentiality & resilience.',
    mappedCategories: ['Compliance', 'Security']
  },
  {
    framework: 'PCI DSS 4.0',
    controlId: 'PCI-Req10',
    name: 'Security Event Logging & Monitoring',
    category: 'Payment Security',
    description: 'Comprehensive audit logging for all access to cardholder data and system components.',
    mappedCategories: ['Security', 'Compliance', 'Technical']
  },
  {
    framework: 'ISO 27001',
    controlId: 'A.8.8',
    name: 'Management of Technical Vulnerabilities',
    category: 'ISMS Controls',
    description: 'Timely evaluation and remediation of technical software dependencies.',
    mappedCategories: ['Technical', 'Security']
  }
];

const HISTORICAL_COMPLIANCE_TREND = [
  { sprint: 'Sprint 1', score: 62, compliant: 4, warning: 5, deficient: 2 },
  { sprint: 'Sprint 2', score: 71, compliant: 6, warning: 4, deficient: 1 },
  { sprint: 'Sprint 3', score: 79, compliant: 7, warning: 3, deficient: 1 },
  { sprint: 'Sprint 4', score: 84, compliant: 8, warning: 2, deficient: 1 },
  { sprint: 'Sprint 5', score: 88, compliant: 9, warning: 2, deficient: 0 },
];

const CROSS_FRAMEWORK_OVERLAPS = [
  {
    action: 'Multi-Factor Authentication & RBAC Telemetry',
    leverage: '5x Framework Coverage',
    satisfiedControls: ['SOC2-CC6.1', 'NIST-RA-1', 'ISO-6.4', 'GDPR-Art32', 'PCI-Req10'],
    category: 'Security'
  },
  {
    action: 'Continuous Automated CVE & Dependency Scanner',
    leverage: '4x Framework Coverage',
    satisfiedControls: ['ISO-27001 A.8.8', 'SOC2-CC7.1', 'NIST-RA-1', 'PCI-Req10'],
    category: 'Technical'
  },
  {
    action: 'Stochastic Risk Rating & 5-Whys RCA Post-Mortems',
    leverage: '3x Framework Coverage',
    satisfiedControls: ['ISO-31000 6.4', 'ISO-31000 6.5', 'SOC2-CC8.1'],
    category: 'Governance'
  }
];

export const ComplianceMatrix: React.FC = () => {
  const { risks, addToast } = useRiskContext();

  const [controlsList, setControlsList] = useState<ComplianceControl[]>(INITIAL_CONTROLS);
  const [selectedFramework, setSelectedFramework] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isSoAModalOpen, setIsSoAModalOpen] = useState<boolean>(false);
  const [isAIAuditModalOpen, setIsAIAuditModalOpen] = useState<boolean>(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState<boolean>(false);
  const [isCustomControlModalOpen, setIsCustomControlModalOpen] = useState<boolean>(false);
  const [activeControlDetail, setActiveControlDetail] = useState<{
    control: ComplianceControl;
    status: 'Compliant' | 'Warning' | 'Non-Compliant';
  } | null>(null);

  const handleAddCustomControl = (newControl: ComplianceControl) => {
    setControlsList(prev => [newControl, ...prev]);
  };

  const complianceResults = useMemo(() => {
    const activeRisks = risks.filter(r => r.status !== 'Closed');

    const controlMappings = controlsList.map(control => {
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

    // Apply Framework, Status, and Search query filters
    const filteredMappings = controlMappings.filter(c => {
      const matchFw = selectedFramework === 'All' || c.framework === selectedFramework;
      const matchStatus = selectedStatus === 'All' || c.status === selectedStatus;
      const matchSearch = !searchQuery.trim() || 
        c.controlId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFw && matchStatus && matchSearch;
    });

    const compliantCount = controlMappings.filter(c => c.status === 'Compliant').length;
    const warningCount = controlMappings.filter(c => c.status === 'Warning').length;
    const nonCompliantCount = controlMappings.filter(c => c.status === 'Non-Compliant').length;
    const healthScore = Math.round((compliantCount / (controlMappings.length || 1)) * 100);

    return {
      controlMappings: filteredMappings,
      totalControls: controlMappings.length,
      compliantCount,
      warningCount,
      nonCompliantCount,
      healthScore
    };
  }, [risks, controlsList, selectedFramework, selectedStatus, searchQuery]);

  const handleExportAuditMemo = () => {
    const lines = [
      `=================================================================`,
      `ENTERPRISE COMPLIANCE AUDIT READINESS MEMO (ISO 31000, NIST & SOC 2)`,
      `Generated: ${new Date().toISOString().split('T')[0]} | MNB Research Operations`,
      `=================================================================\n`,
      `OVERVIEW HEALTH SCORE: ${complianceResults.healthScore}%`,
      `Compliant Controls: ${complianceResults.compliantCount}`,
      `Warning Controls: ${complianceResults.warningCount}`,
      `Deficient / Non-Compliant Controls: ${complianceResults.nonCompliantCount}\n`,
      `DETAILED CONTROL COMPLIANCE MAPPING (${complianceResults.controlMappings.length} Controls Filtered):`,
      `-----------------------------------------------------------------`
    ];

    complianceResults.controlMappings.forEach(c => {
      lines.push(`[${c.framework}] ${c.controlId}: ${c.name}`);
      lines.push(`  Status: ${c.status.toUpperCase()} | Associated Live Risks: ${c.mappedRiskCount} | Unmitigated: ${c.unmitigatedCount}`);
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

    addToast('Audit Memo Downloaded', 'Exported regulatory audit readiness memo.', 'success');
  };

  return (
    <>
      <SoAExportModal
        isOpen={isSoAModalOpen}
        onClose={() => setIsSoAModalOpen(false)}
      />

      <AIComplianceAuditModal
        isOpen={isAIAuditModalOpen}
        onClose={() => setIsAIAuditModalOpen(false)}
        selectedFramework={selectedFramework}
      />

      <ComplianceCertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        healthScore={complianceResults.healthScore}
        compliantCount={complianceResults.compliantCount}
        warningCount={complianceResults.warningCount}
        nonCompliantCount={complianceResults.nonCompliantCount}
        totalControls={complianceResults.totalControls}
      />

      <CustomControlModal
        isOpen={isCustomControlModalOpen}
        onClose={() => setIsCustomControlModalOpen(false)}
        onAddControl={handleAddCustomControl}
      />

      <ControlDetailModal
        control={activeControlDetail?.control || null}
        status={activeControlDetail?.status || 'Compliant'}
        isOpen={!!activeControlDetail}
        onClose={() => setActiveControlDetail(null)}
      />

      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Enterprise Compliance & Governance Control Matrix
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Automated alignment of live register threats against <strong>ISO 31000</strong>, <strong>NIST SP 800-30</strong>, <strong>SOC 2 Type II</strong>, and <strong>GDPR</strong> frameworks.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="copilot"
              size="sm"
              icon={<Sparkles className="w-3.5 h-3.5 text-indigo-200" />}
              onClick={() => setIsAIAuditModalOpen(true)}
            >
              Run AI Compliance Audit
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={<Award className="w-3.5 h-3.5 text-indigo-300" />}
              onClick={() => setIsCertModalOpen(true)}
            >
              CISO Audit Package
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5 text-indigo-600" />}
              onClick={() => setIsCustomControlModalOpen(true)}
            >
              Add Custom Control
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={<Shield className="w-3.5 h-3.5 text-indigo-600" />}
              onClick={() => setIsSoAModalOpen(true)}
            >
              ISO 27001 SoA
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={<FileCheck className="w-3.5 h-3.5 text-indigo-600" />}
              onClick={handleExportAuditMemo}
            >
              Export Memo (.TXT)
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

        {/* Cross-Framework Overlap & Trend Visualizers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Historical Health Trend Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  Compliance Readiness Trajectory (Historical Sprint Trend)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Improvement of enterprise compliance rating over recent mitigation cycles.
                </p>
              </div>
              <span className="text-xs font-mono font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                +26% Growth
              </span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={HISTORICAL_COMPLIANCE_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="sprint" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[40, 100]} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                    formatter={(val: any) => [`${val}% Readiness`, 'Health Score']}
                  />
                  <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cross-Framework Mitigation Multiplier */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-md space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" /> Multi-Framework Leverage
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                  5x Efficiency
                </span>
              </div>
              <h4 className="text-sm font-extrabold tracking-tight">Cross-Framework Mitigation ROI</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Single security controls satisfy multiple regulatory frameworks simultaneously:
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {CROSS_FRAMEWORK_OVERLAPS.map((item, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white text-[11px] truncate">{item.action}</span>
                    <span className="font-mono text-[9px] font-extrabold text-indigo-300 bg-indigo-500/30 px-1.5 py-0.5 rounded">
                      {item.leverage}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {item.satisfiedControls.map(c => (
                      <span key={c} className="text-[9px] font-mono text-slate-300 bg-slate-800/80 px-1.5 py-0.2 rounded">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          {/* Framework Filter Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['All', 'ISO 31000', 'NIST SP 800-30', 'SOC 2 Type II', 'GDPR', 'PCI DSS 4.0', 'ISO 27001', 'HIPAA', 'Custom Policy'].map(fw => (
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

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search control ID or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
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
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complianceResults.controlMappings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                      No compliance controls match the selected filters.
                    </td>
                  </tr>
                ) : (
                  complianceResults.controlMappings.map((c) => (
                    <tr 
                      key={c.controlId} 
                      onClick={() => setActiveControlDetail({ control: c, status: c.status })}
                      className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="p-3 whitespace-nowrap font-bold text-slate-900">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px]">
                          {c.framework}
                        </span>
                      </td>
                      <td className="p-3 max-w-xs">
                        <div className="font-mono text-[10px] font-bold text-slate-400">{c.controlId}</div>
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{c.name}</div>
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
                      <td className="p-3 text-right whitespace-nowrap">
                        <span className="text-indigo-600 font-bold text-[11px] inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                          Inspect <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};
