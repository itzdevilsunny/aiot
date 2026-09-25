'use client';

import React, { useMemo } from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { Button } from '../ui/Button';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Database, 
  Globe, 
  Cpu, 
  FileCheck, 
  Sparkles, 
  AlertTriangle,
  Zap
} from 'lucide-react';

interface ThreatVector {
  id: string;
  name: string;
  category: string;
  icon: any;
  threatLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  score: number; // 0-100
  mappedRiskCount: number;
  recommendation: string;
}

export const SecurityThreatSurface: React.FC = () => {
  const { risks, addToast } = useRiskContext();

  const threatVectors = useMemo<ThreatVector[]>(() => {
    const activeRisks = risks.filter(r => r.status !== 'Closed');

    const getCount = (cat: string) => activeRisks.filter(r => r.category === cat).length;
    const getCriticals = (cat: string) => activeRisks.filter(r => r.category === cat && (r.severity === 'Critical' || r.severity === 'High')).length;

    return [
      {
        id: 'VEC-1',
        name: 'API Gateway & Network Security',
        category: 'Technical',
        icon: Globe,
        threatLevel: getCriticals('Technical') > 1 ? 'Critical' : 'Medium',
        score: Math.min(100, 45 + getCount('Technical') * 12),
        mappedRiskCount: getCount('Technical'),
        recommendation: 'Deploy WAF rate-limiting and enforce mTLS authentication on all API routes.'
      },
      {
        id: 'VEC-2',
        name: 'Identity & Access Management (IAM)',
        category: 'Security',
        icon: KeyRound,
        threatLevel: getCriticals('Security') > 0 ? 'High' : 'Low',
        score: Math.min(100, 30 + getCount('Security') * 15),
        mappedRiskCount: getCount('Security'),
        recommendation: 'Enforce mandatory MFA and eliminate long-lived service account tokens.'
      },
      {
        id: 'VEC-3',
        name: 'Database Encryption & Storage Security',
        category: 'Technical',
        icon: Database,
        threatLevel: 'High',
        score: 65,
        mappedRiskCount: 2,
        recommendation: 'Enable KMS CMEK encryption at rest and restrict database read replicas.'
      },
      {
        id: 'VEC-4',
        name: 'Third-Party SaaS Vendor Supply Chain',
        category: 'External',
        icon: Cpu,
        threatLevel: getCount('External') > 0 ? 'High' : 'Low',
        score: Math.min(100, 20 + getCount('External') * 20),
        mappedRiskCount: getCount('External'),
        recommendation: 'Audit third-party SOC 2 Type II evidence reports and vendor SLA guarantees.'
      },
      {
        id: 'VEC-5',
        name: 'CI/CD Build Pipeline Security',
        category: 'Operational',
        icon: ShieldAlert,
        threatLevel: 'Medium',
        score: 40,
        mappedRiskCount: getCount('Operational'),
        recommendation: 'Automate static code analysis (SAST) and container vulnerability scanning in GitHub Actions.'
      },
      {
        id: 'VEC-6',
        name: 'Data Privacy & GDPR Regulatory Guard',
        category: 'Compliance',
        icon: FileCheck,
        threatLevel: getCount('Compliance') > 0 ? 'High' : 'Low',
        score: Math.min(100, 25 + getCount('Compliance') * 18),
        mappedRiskCount: getCount('Compliance'),
        recommendation: 'Maintain continuous data mapping and execute Data Protection Impact Assessments (DPIA).'
      }
    ];
  }, [risks]);

  const avgAttackSurfaceScore = Math.round(
    threatVectors.reduce((acc, v) => acc + v.score, 0) / (threatVectors.length || 1)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Enterprise Cyber Threat Surface & Attack Surface Mapper
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time attack vector exposure monitoring across 6 critical infrastructure security domains.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            Overall Attack Surface Score: <strong className="text-indigo-700 font-mono text-sm">{avgAttackSurfaceScore} / 100</strong>
          </span>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monitored Vectors</span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{threatVectors.length} Domains</div>
          <span className="text-[11px] text-slate-500">Continuous security mapping</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Critical Exposure Vectors</span>
          <div className="text-2xl font-black text-red-950 mt-1 font-mono">
            {threatVectors.filter(v => v.threatLevel === 'Critical' || v.threatLevel === 'High').length} High Risk
          </div>
          <span className="text-[11px] text-red-600 font-semibold">Requires security patch runbook</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-indigo-200 bg-indigo-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Security Hardening Status</span>
          <div className="text-2xl font-black text-indigo-950 mt-1 font-mono">
            {avgAttackSurfaceScore < 50 ? 'Strong' : avgAttackSurfaceScore < 70 ? 'Moderate' : 'Elevated'}
          </div>
          <span className="text-[11px] text-indigo-600 font-medium">Infrastructure posture rating</span>
        </div>
      </div>

      {/* Threat Surface Vectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {threatVectors.map((v) => {
          const IconComponent = v.icon;
          return (
            <div 
              key={v.id} 
              className={`p-5 rounded-2xl bg-white border transition-all shadow-2xs space-y-3 ${
                v.threatLevel === 'Critical' ? 'border-red-300 ring-1 ring-red-200' :
                v.threatLevel === 'High' ? 'border-amber-300' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] font-bold text-slate-400">{v.id}</span>
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">{v.name}</h3>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                  v.threatLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                  v.threatLevel === 'High' ? 'bg-amber-100 text-amber-800' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {v.threatLevel}
                </span>
              </div>

              {/* Exposure Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 mb-1">
                  <span>Exposure Score</span>
                  <span className="font-mono font-bold text-slate-900">{v.score} / 100</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      v.score >= 70 ? 'bg-red-600' : v.score >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${v.score}%` }}
                  />
                </div>
              </div>

              {/* Recommendation Box */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-700 space-y-1">
                <span className="font-bold text-slate-900 block text-[10px] uppercase">Recommended Defense:</span>
                <p className="leading-relaxed font-medium">{v.recommendation}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
