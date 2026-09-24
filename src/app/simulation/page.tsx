'use client';

import React, { useState, useMemo } from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { 
  SlidersHorizontal, 
  TrendingUp, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  DollarSign, 
  RotateCcw,
  Activity,
  CheckCircle2,
  BrainCircuit,
  BarChart3,
  FolderKanban,
  Download,
  ShieldCheck,
  Zap,
  FileSpreadsheet
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Button } from '../../components/ui/Button';

const CATEGORY_COLORS: Record<string, string> = {
  Technical: '#6366f1',
  Financial: '#10b981',
  Security: '#ef4444',
  Compliance: '#f59e0b',
  Operational: '#06b6d4',
  Resource: '#8b5cf6',
  External: '#ec4899',
  Schedule: '#f97316'
};

export default function SimulationPage() {
  const { risks, projects, selectedProjectId, addToast } = useRiskContext();

  // Filters & Stress Controls
  const [activeProjectFilter, setActiveProjectFilter] = useState<string>('All');
  const [cyberSpike, setCyberSpike] = useState<number>(0); // 0% to +100%
  const [financialInflation, setFinancialInflation] = useState<number>(0); // 0% to +50%
  const [vendorDelayMultiplier, setVendorDelayMultiplier] = useState<number>(1.0); // 1.0x to 2.5x
  const [simIterations, setSimIterations] = useState<number>(1000); // 1000, 5000, 10000

  // Format currency helper
  const formatUSD = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
    return `$${Math.round(val).toLocaleString()}`;
  };

  // Run 100% Live Monte Carlo Stochastic Simulation
  const simulationResults = useMemo(() => {
    const targetRisks = risks.filter(r => {
      if (r.status === 'Closed' || r.status === 'Mitigated') return false;
      if (activeProjectFilter !== 'All' && r.projectId !== activeProjectFilter) return false;
      return true;
    });

    const activeRiskList = targetRisks.length > 0 ? targetRisks : risks;

    const losses: number[] = [];
    const categoryTotals: Record<string, number> = {};

    for (let i = 0; i < simIterations; i++) {
      let iterLoss = 0;

      activeRiskList.forEach(risk => {
        // Base probability scaled (1-5 -> 0.15 to 0.85)
        let prob = risk.probability * 0.17;

        // Apply stress multipliers
        if (risk.category === 'Security' || risk.category === 'Technical') {
          prob = Math.min(0.95, prob * (1 + cyberSpike / 100));
        } else if (risk.category === 'Operational' || risk.category === 'External' || risk.category === 'Schedule') {
          prob = Math.min(0.95, prob * vendorDelayMultiplier);
        }

        // Event occurrence check
        if (Math.random() <= prob) {
          let baseImpact = risk.estimatedImpactUsd || (risk.score * 25000);

          if (risk.category === 'Financial' || risk.category === 'Compliance' || risk.category === 'Operational') {
            baseImpact *= (1 + financialInflation / 100);
          }

          // Stochastic triangular variation (+/- 25%)
          const variation = (Math.random() + Math.random() - 1) * 0.25;
          const lossValue = Math.max(0, baseImpact * (1 + variation));

          iterLoss += lossValue;
          categoryTotals[risk.category] = (categoryTotals[risk.category] || 0) + lossValue;
        }
      });

      losses.push(iterLoss);
    }

    losses.sort((a, b) => a - b);

    const p10 = losses[Math.floor(losses.length * 0.10)] || 0;
    const p50 = losses[Math.floor(losses.length * 0.50)] || 0;
    const p90 = losses[Math.floor(losses.length * 0.90)] || 0;
    const p99 = losses[Math.floor(losses.length * 0.99)] || 0;
    const maxLoss = losses[losses.length - 1] || 0;

    // Build Histogram (15 buckets)
    const bucketCount = 15;
    const minL = losses[0] || 0;
    const maxL = maxLoss || 100000;
    const step = (maxL - minL) / bucketCount || 10000;

    const histogram: { rangeLabel: string; frequency: number }[] = [];
    for (let b = 0; b < bucketCount; b++) {
      const bMin = minL + b * step;
      const bMax = bMin + step;
      const countInBucket = losses.filter(l => l >= bMin && (b === bucketCount - 1 ? l <= bMax : l < bMax)).length;

      histogram.push({
        rangeLabel: formatUSD(bMax),
        frequency: countInBucket
      });
    }

    // Category Loss Distribution data for Pie Chart
    const categoryPieData = Object.entries(categoryTotals).map(([cat, total]) => ({
      name: cat,
      value: Math.round(total / simIterations),
      color: CATEGORY_COLORS[cat] || '#64748b'
    })).sort((a, b) => b.value - a.value);

    // Top 5 Contributing Risks to VaR
    const topContributors = activeRiskList.map(r => {
      const impact = r.estimatedImpactUsd || (r.score * 25000);
      const expectedExp = r.probability * 0.2 * impact;
      return {
        ...r,
        expectedExp
      };
    }).sort((a, b) => b.expectedExp - a.expectedExp).slice(0, 5);

    return {
      activeRiskCount: activeRiskList.length,
      p10,
      p50,
      p90,
      p99,
      maxLoss,
      histogram,
      categoryPieData,
      topContributors,
      contingencyReserve: p90 * 1.15
    };
  }, [risks, activeProjectFilter, cyberSpike, financialInflation, vendorDelayMultiplier, simIterations]);

  const handleReset = () => {
    setActiveProjectFilter('All');
    setCyberSpike(0);
    setFinancialInflation(0);
    setVendorDelayMultiplier(1.0);
    setSimIterations(1000);
    addToast('Simulation Reset', 'Restored baseline parameters.', 'info');
  };

  const handleExportSimulationCSV = () => {
    const headers = ['Simulation Iterations', 'Project Filter', 'P50 Expected Loss', 'P90 VaR Severe Loss', 'P99 Extreme Loss', 'Recommended Liquidity Reserve'];
    const row = [
      simIterations,
      activeProjectFilter,
      `"${formatUSD(simulationResults.p50)}"`,
      `"${formatUSD(simulationResults.p90)}"`,
      `"${formatUSD(simulationResults.p99)}"`,
      `"${formatUSD(simulationResults.contingencyReserve)}"`
    ];

    const csvContent = [headers.join(','), row.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Monte_Carlo_Simulation_Report_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Simulation Report Exported', 'Downloaded Executive Monte Carlo VaR CSV Report.', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Enterprise Monte Carlo & Stress Testing Engine
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Simulate 1,000–10,000 stochastic operational scenarios to calculate Expected Loss (P50), Value-at-Risk (VaR P90), and capital liquidity buffers.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={<FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />}
            onClick={handleExportSimulationCSV}
          >
            Export Monte Carlo Report (.CSV)
          </Button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Control Bar: Workspace Selector & Iteration Run Selector */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <FolderKanban className="w-4 h-4 text-indigo-600" />
            <span>Target Workstream:</span>
          </div>
          <select
            value={activeProjectFilter}
            onChange={(e) => setActiveProjectFilter(e.target.value)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none cursor-pointer"
          >
            <option value="All">MNB Research Operations (All Workstreams)</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <span className="text-xs font-semibold text-slate-500">Stochastic Iterations:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {[1000, 5000, 10000].map(count => (
              <button
                key={count}
                onClick={() => setSimIterations(count)}
                className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md transition-all cursor-pointer ${
                  simIterations === count
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {count.toLocaleString()} Runs
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Cards Top Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expected Loss (P50 Median)</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {formatUSD(simulationResults.p50)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-blue-500" />
            Baseline most probable financial loss
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50/30 to-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Severe Loss (P90 VaR)</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-900 mt-2 font-mono">
            {formatUSD(simulationResults.p90)}
          </div>
          <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
            <span>90th percentile worst-case risk exposure</span>
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/30 to-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Recommended Reserve</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-950 mt-2 font-mono">
            {formatUSD(simulationResults.contingencyReserve)}
          </div>
          <p className="text-[11px] text-emerald-600 mt-1">
            Includes 15% safety liquidity buffer
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">P99 Black Swan Extreme</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-900 mt-2 font-mono">
            {formatUSD(simulationResults.p99)}
          </div>
          <p className="text-[11px] text-red-600 font-semibold mt-1">
            99th percentile extreme tail loss
          </p>
        </div>
      </div>

      {/* Main Grid: Stress Controls + Live Histogram Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Stress Controls Panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <span>Macro Scenario Stress Multipliers</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold uppercase">
              Interactive
            </span>
          </div>

          {/* Slider 1: Cyber Spike */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                Cyber Attack Frequency Spike
              </label>
              <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                +{cyberSpike}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={cyberSpike}
              onChange={e => setCyberSpike(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <p className="text-[11px] text-slate-500">
              Increases probability of security & IT infrastructure threats.
            </p>
          </div>

          {/* Slider 2: Inflation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                Supply Chain & Inflation Surge
              </label>
              <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                +{financialInflation}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={financialInflation}
              onChange={e => setFinancialInflation(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <p className="text-[11px] text-slate-500">
              Escalates financial & operational damage per risk event.
            </p>
          </div>

          {/* Slider 3: Vendor Delay */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Vendor & Third-Party Delay Index
              </label>
              <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                {vendorDelayMultiplier.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.1"
              value={vendorDelayMultiplier}
              onChange={e => setVendorDelayMultiplier(Number(e.target.value))}
              className="w-full bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-600 h-2"
            />
            <p className="text-[11px] text-slate-500">
              Multiplies failure probability across operational dependencies.
            </p>
          </div>

          {/* AI Guidance Box */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white space-y-2">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-slate-100">AI Scenario Synthesis</h4>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              {cyberSpike > 30 || financialInflation > 20 || vendorDelayMultiplier > 1.5 ? (
                <span className="text-amber-300">
                  ⚠️ <strong>High Stress Scenario Active:</strong> P90 Value-at-Risk reaches {formatUSD(simulationResults.p90)}. Recommending an extra capital buffer of {formatUSD(simulationResults.p90 - simulationResults.p50)}.
                </span>
              ) : (
                <span>
                  🟢 <strong>Normal Resilience Profile:</strong> Active operational risks ({simulationResults.activeRiskCount} items) are well-contained within baseline {formatUSD(simulationResults.p50)} Expected Loss.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Histogram Chart Panel */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>Simulated Loss Distribution (Probability Density & VaR)</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Frequency histogram of simulated financial outcomes over {simIterations.toLocaleString()} iterations.
              </p>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                Iteration Frequency
              </span>
            </div>
          </div>

          <div className="h-[320px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={simulationResults.histogram} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="rangeLabel" 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderRadius: '8px', 
                    color: '#fff', 
                    fontSize: '11px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    border: 'none'
                  }}
                  formatter={(value: any) => [
                    `${value} simulation runs`,
                    'Frequency'
                  ]}
                />
                <Bar dataKey="frequency" fill="#6366f1" radius={[4, 4, 0, 0]} name="frequency" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Top 5 Risk Exposure Contributors Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Top Risk Exposure Contributors Driving Value-at-Risk</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Live register items sorted by stochastic exposure impact.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {simulationResults.topContributors.map((r, idx) => (
            <div key={r.id} className="py-3 flex items-center justify-between text-xs gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-extrabold text-[10px] flex items-center justify-center shrink-0">
                  #{idx + 1}
                </span>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                      {r.id}
                    </span>
                    <h4 className="font-bold text-slate-900 truncate">{r.title}</h4>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Category: {r.category} • Owner: {r.ownerName} ({r.projectName})
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-extrabold text-indigo-950 font-mono">
                  {formatUSD(r.expectedExp)}
                </div>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                  r.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                  r.severity === 'High' ? 'bg-amber-100 text-amber-800' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {r.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
