'use client';

import React from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { Button } from '../ui/Button';
import { KRIItem } from '../analytics/KRIMonitoring';
import { 
  Gauge, 
  X, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Zap, 
  RefreshCw,
  Sparkles
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

interface KRIDetailModalProps {
  kri: KRIItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSimulateSpike: (id: string) => void;
  onResetMetric: (id: string) => void;
}

export const KRIDetailModal: React.FC<KRIDetailModalProps> = ({
  kri,
  isOpen,
  onClose,
  onSimulateSpike,
  onResetMetric
}) => {
  const { risks } = useRiskContext();

  if (!isOpen || !kri) return null;

  const linkedRisk = risks.find(r => r.id === kri.linkedRiskId) || risks[0];

  // 7-day telemetry history data points
  const historyData = [
    { day: 'Day 1', value: Math.round(kri.currentValue * 0.75 * 10) / 10 },
    { day: 'Day 2', value: Math.round(kri.currentValue * 0.82 * 10) / 10 },
    { day: 'Day 3', value: Math.round(kri.currentValue * 0.90 * 10) / 10 },
    { day: 'Day 4', value: Math.round(kri.currentValue * 0.88 * 10) / 10 },
    { day: 'Day 5', value: Math.round(kri.currentValue * 0.95 * 10) / 10 },
    { day: 'Day 6', value: Math.round(kri.currentValue * 0.98 * 10) / 10 },
    { day: 'Today', value: kri.currentValue },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-indigo-200 bg-indigo-500/30 px-2 py-0.5 rounded">
                  {kri.id} &bull; {kri.category}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  kri.status === 'Breached' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                  kri.status === 'Warning' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {kri.status}
                </span>
              </div>
              <h2 className="text-base font-extrabold tracking-tight mt-0.5">
                {kri.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Threshold Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Live Telemetry</span>
              <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
                {kri.currentValue} <span className="text-xs font-normal text-slate-500">{kri.unit}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl text-center">
              <span className="text-[10px] font-bold text-amber-700 uppercase">Warning Limit</span>
              <div className="text-xl font-black text-amber-950 font-mono mt-0.5">
                {kri.targetThreshold} <span className="text-xs font-normal text-amber-700">{kri.unit}</span>
              </div>
            </div>

            <div className="p-3 bg-red-50/50 border border-red-200 rounded-xl text-center">
              <span className="text-[10px] font-bold text-red-700 uppercase">Critical Breach</span>
              <div className="text-xl font-black text-red-950 font-mono mt-0.5">
                {kri.criticalThreshold} <span className="text-xs font-normal text-red-700">{kri.unit}</span>
              </div>
            </div>
          </div>

          {/* 7-Day Sparkline Chart */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" /> 7-Day Telemetry Trend
              </span>
              <span className="text-slate-400 font-mono text-[10px]">Updated: {kri.lastUpdated}</span>
            </div>

            <div className="h-36 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorKri" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={kri.status === 'Breached' ? '#dc2626' : '#4f46e5'} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={kri.status === 'Breached' ? '#dc2626' : '#4f46e5'} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                    formatter={(val: any) => [`${val} ${kri.unit}`, 'Value']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={kri.status === 'Breached' ? '#dc2626' : '#4f46e5'} 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#colorKri)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Linked Operational Risk Item */}
          {linkedRisk && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Linked Register Item</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  linkedRisk.severity === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {linkedRisk.severity}
                </span>
              </div>
              <div className="font-bold text-slate-900 text-xs">{linkedRisk.id}: {linkedRisk.title}</div>
              <p className="text-slate-600 text-[11px] leading-relaxed">{linkedRisk.description}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            icon={<RefreshCw className="w-3.5 h-3.5 text-slate-600" />}
            onClick={() => onResetMetric(kri.id)}
          >
            Reset Metric Baseline
          </Button>

          <Button
            variant="copilot"
            size="sm"
            icon={<Zap className="w-3.5 h-3.5 text-amber-300" />}
            onClick={() => onSimulateSpike(kri.id)}
          >
            Simulate Telemetry Breach (+80%)
          </Button>
        </div>
      </div>
    </div>
  );
};
