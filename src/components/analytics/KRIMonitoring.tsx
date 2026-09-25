'use client';

import React, { useState } from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { Button } from '../ui/Button';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles, 
  Zap, 
  RefreshCw,
  BellRing,
  Gauge,
  ShieldAlert
} from 'lucide-react';

interface KRIItem {
  id: string;
  name: string;
  category: string;
  currentValue: number;
  unit: string;
  targetThreshold: number;
  criticalThreshold: number;
  status: 'Normal' | 'Warning' | 'Breached';
  linkedRiskId: string;
  lastUpdated: string;
}

const INITIAL_KRIS: KRIItem[] = [
  {
    id: 'KRI-101',
    name: 'Production API Response Latency (p99)',
    category: 'Technical',
    currentValue: 124,
    unit: 'ms',
    targetThreshold: 150,
    criticalThreshold: 300,
    status: 'Normal',
    linkedRiskId: 'RSK-101',
    lastUpdated: '2 mins ago'
  },
  {
    id: 'KRI-102',
    name: 'Database Connection Pool Lock Saturation',
    category: 'Technical',
    currentValue: 68,
    unit: '%',
    targetThreshold: 50,
    criticalThreshold: 80,
    status: 'Warning',
    linkedRiskId: 'RSK-101',
    lastUpdated: 'Just now'
  },
  {
    id: 'KRI-103',
    name: 'Monthly Cloud Infrastructure Budget Variance',
    category: 'Financial',
    currentValue: 14.2,
    unit: '%',
    targetThreshold: 5.0,
    criticalThreshold: 20.0,
    status: 'Warning',
    linkedRiskId: 'RSK-103',
    lastUpdated: '1 hour ago'
  },
  {
    id: 'KRI-104',
    name: 'Senior Engineering Team Turnover Rate',
    category: 'Resource',
    currentValue: 18.5,
    unit: '%',
    targetThreshold: 8.0,
    criticalThreshold: 15.0,
    status: 'Breached',
    linkedRiskId: 'RSK-102',
    lastUpdated: '3 hours ago'
  },
  {
    id: 'KRI-105',
    name: 'Unmitigated Security Compliance Deficiencies',
    category: 'Compliance',
    currentValue: 0,
    unit: 'items',
    targetThreshold: 1,
    criticalThreshold: 3,
    status: 'Normal',
    linkedRiskId: 'RSK-104',
    lastUpdated: '5 mins ago'
  }
];

export const KRIMonitoring: React.FC = () => {
  const { risks, updateRiskStatus, addToast } = useRiskContext();
  const [kriList, setKriList] = useState<KRIItem[]>(INITIAL_KRIS);

  const handleSimulateSpike = (id: string) => {
    setKriList(prev => prev.map(kri => {
      if (kri.id !== id) return kri;

      const spikedVal = Math.round(kri.currentValue * 1.8 * 10) / 10;
      const isBreached = spikedVal >= kri.criticalThreshold;

      if (isBreached) {
        addToast(
          '⚠️ KRI SLA Breach Triggered!',
          `${kri.name} reached ${spikedVal} ${kri.unit} (Threshold: ${kri.criticalThreshold} ${kri.unit}). Auto-escalated linked risk ${kri.linkedRiskId}.`,
          'error'
        );
        // Escalate linked risk to Critical/Open in risk register
        updateRiskStatus(kri.linkedRiskId, 'Open');
      }

      return {
        ...kri,
        currentValue: spikedVal,
        status: isBreached ? 'Breached' : spikedVal > kri.targetThreshold ? 'Warning' : 'Normal',
        lastUpdated: 'Just now'
      };
    }));
  };

  const handleResetKRI = () => {
    setKriList(INITIAL_KRIS);
    addToast('KRI Telemetry Reset', 'Restored baseline SLA indicator thresholds.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Gauge className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Key Risk Indicator (KRI) Early-Warning Telemetry
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time metric thresholds monitoring operational performance and auto-escalating SLA breach threats.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5 text-slate-600" />}
            onClick={handleResetKRI}
          >
            Reset Metrics
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Active KRIs</span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{kriList.length} Metrics</div>
          <span className="text-[11px] text-slate-500">Continuous telemetry feed</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Warning Level</span>
          <div className="text-2xl font-black text-amber-950 mt-1 font-mono">
            {kriList.filter(k => k.status === 'Warning').length} Indicators
          </div>
          <span className="text-[11px] text-amber-600 font-medium">Approaching target threshold</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Breached SLA Triggers</span>
          <div className="text-2xl font-black text-red-950 mt-1 font-mono">
            {kriList.filter(k => k.status === 'Breached').length} Critical
          </div>
          <span className="text-[11px] text-red-600 font-semibold">Auto-escalated to Risk Register</span>
        </div>
      </div>

      {/* KRI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {kriList.map((kri) => (
          <div 
            key={kri.id}
            className={`p-5 rounded-2xl bg-white border transition-all shadow-2xs space-y-3 ${
              kri.status === 'Breached' ? 'border-red-300 ring-1 ring-red-200' :
              kri.status === 'Warning' ? 'border-amber-300' : 'border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {kri.id}
                  </span>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {kri.category}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{kri.name}</h3>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                kri.status === 'Breached' ? 'bg-red-100 text-red-800' :
                kri.status === 'Warning' ? 'bg-amber-100 text-amber-800' :
                'bg-emerald-100 text-emerald-800'
              }`}>
                {kri.status}
              </span>
            </div>

            {/* Current Value Gauge */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Live Value</span>
                <div className="text-xl font-black text-slate-900 font-mono">
                  {kri.currentValue} <span className="text-xs text-slate-500 font-normal">{kri.unit}</span>
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-500 space-y-0.5">
                <div>Warning Limit: <strong className="text-slate-800 font-mono">{kri.targetThreshold} {kri.unit}</strong></div>
                <div>Critical Breach: <strong className="text-red-700 font-mono">{kri.criticalThreshold} {kri.unit}</strong></div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[10px] text-slate-400">Linked Register Item: <strong className="text-slate-700">{kri.linkedRiskId}</strong></span>
              <Button
                variant="outline"
                size="sm"
                icon={<Zap className="w-3 h-3 text-amber-500" />}
                onClick={() => handleSimulateSpike(kri.id)}
              >
                Simulate Telemetry Breach
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
