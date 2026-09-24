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
  BarChart3
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar
} from 'recharts';

export default function SimulationPage() {
  const { risks } = useRiskContext();

  // Stress testing parameters
  const [cyberSpike, setCyberSpike] = useState<number>(0); // 0% to +100%
  const [financialInflation, setFinancialInflation] = useState<number>(0); // 0% to +50%
  const [vendorDelayMultiplier, setVendorDelayMultiplier] = useState<number>(1.0); // 1.0x to 2.5x
  const [simCount] = useState<number>(1000); // 1000 iterations

  // Helper to format currency
  const formatUSD = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
    return `$${Math.round(val).toLocaleString()}`;
  };

  // Run Monte Carlo stochastic simulation calculation
  const simulationResults = useMemo(() => {
    const openRisks = risks.filter(r => r.status !== 'Closed' && r.status !== 'Mitigated');

    // Run N iterations
    const losses: number[] = [];

    for (let i = 0; i < simCount; i++) {
      let totalIterLoss = 0;

      openRisks.forEach(risk => {
        // Base probability (1-5 scaled to 0.1 to 0.9)
        let prob = risk.probability * 0.18;
        
        // Apply category stress multipliers
        if (risk.category === 'Security' || risk.category === 'Technical') {
          prob = Math.min(0.95, prob * (1 + cyberSpike / 100));
        } else if (risk.category === 'Operational' || risk.category === 'External' || risk.category === 'Schedule') {
          prob = Math.min(0.95, prob * vendorDelayMultiplier);
        }

        // Check if event occurs in this simulation step
        if (Math.random() <= prob) {
          // Financial Impact
          let baseImpact = risk.estimatedImpactUsd || (risk.impact * 25000);
          
          // Apply Inflation stress multiplier
          if (risk.category === 'Financial' || risk.category === 'Compliance' || risk.category === 'Operational') {
            baseImpact *= (1 + financialInflation / 100);
          }

          // Random variation within +/- 25% (Triangular stochastic distribution)
          const variation = (Math.random() + Math.random() - 1) * 0.25;
          const iterLoss = Math.max(0, baseImpact * (1 + variation));
          
          totalIterLoss += iterLoss;
        }
      });

      losses.push(totalIterLoss);
    }

    // Sort losses ascending
    losses.sort((a, b) => a - b);

    // Calculate statistical metrics
    const mean = losses.reduce((sum, l) => sum + l, 0) / losses.length;
    const p10 = losses[Math.floor(losses.length * 0.10)] || 0;
    const p50 = losses[Math.floor(losses.length * 0.50)] || 0;
    const p90 = losses[Math.floor(losses.length * 0.90)] || 0;
    const maxLoss = losses[losses.length - 1] || 0;

    // Build Histogram buckets
    const bucketCount = 15;
    const minL = losses[0] || 0;
    const maxL = maxLoss || 100000;
    const step = (maxL - minL) / bucketCount || 10000;

    const histogram: { rangeLabel: string; frequency: number; cumulativePct: number }[] = [];
    let countSoFar = 0;

    for (let b = 0; b < bucketCount; b++) {
      const bMin = minL + b * step;
      const bMax = bMin + step;
      const countInBucket = losses.filter(l => l >= bMin && (b === bucketCount - 1 ? l <= bMax : l < bMax)).length;
      countSoFar += countInBucket;

      histogram.push({
        rangeLabel: formatUSD(bMax),
        frequency: countInBucket,
        cumulativePct: Math.round((countSoFar / losses.length) * 100)
      });
    }

    return {
      mean,
      p10,
      p50,
      p90,
      maxLoss,
      histogram,
      contingencyReserve: p90 * 1.15
    };
  }, [risks, cyberSpike, financialInflation, vendorDelayMultiplier, simCount]);

  const handleReset = () => {
    setCyberSpike(0);
    setFinancialInflation(0);
    setVendorDelayMultiplier(1.0);
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
              Enterprise Risk Monte Carlo & Stress Testing Engine
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Simulate 1,000+ stochastic operational scenarios to forecast Expected Losses, Value-at-Risk (VaR P90), and recommended contingency reserves.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Parameters
          </button>
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
          <div className="text-2xl font-black text-slate-900 mt-2">
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
          <div className="text-2xl font-black text-amber-900 mt-2">
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
          <div className="text-2xl font-black text-emerald-950 mt-2">
            {formatUSD(simulationResults.contingencyReserve)}
          </div>
          <p className="text-[11px] text-emerald-600 mt-1">
            Includes 15% safety liquidity buffer
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Simulated Runs</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {simCount.toLocaleString()} Iterations
          </div>
          <p className="text-[11px] text-indigo-600 font-semibold mt-1">
            Triangular Distribution Monte Carlo
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
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {cyberSpike > 30 || financialInflation > 20 || vendorDelayMultiplier > 1.5 ? (
                <span className="text-amber-300 font-medium">
                  ⚠️ <strong>High Stress Scenario Detected:</strong> Total P90 exposure exceeds normal capital buffers. Recommend initiating hedging strategies and increasing cybersecurity insurance reserves by at least {formatUSD(simulationResults.p90 - simulationResults.p50)}.
                </span>
              ) : (
                <span>
                  🟢 <strong>Normal Resilience Profile:</strong> Baseline operational risks are well-contained within the current {formatUSD(simulationResults.p50)} expected loss margin.
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
                <span>Simulated Loss Distribution (Probability Density & Cumulative VaR)</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Frequency histogram of simulated financial outcomes over {simCount} iterations.
              </p>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                Loss Frequency
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
                    `${value} iterations`,
                    'Frequency'
                  ]}
                />
                <Bar dataKey="frequency" fill="#6366f1" radius={[4, 4, 0, 0]} name="frequency" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Risk Treatment & Strategic Recommendations */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Strategic Executive Risk Mitigation Directives</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Directive 1 · Financial Reserves</span>
            <h4 className="text-xs font-extrabold text-slate-900">Capital Contingency Allocation</h4>
            <p className="text-[11px] text-slate-600">
              Earmark <strong>{formatUSD(simulationResults.contingencyReserve)}</strong> in working capital reserves to absorb multi-threat tail risks without jeopardizing quarter operational EBITDA.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Directive 2 · Operational SLAs</span>
            <h4 className="text-xs font-extrabold text-slate-900">High-Severity Review Cadence</h4>
            <p className="text-[11px] text-slate-600">
              Enforce bi-weekly mitigation updates for all {risks.filter(r => r.severity === 'Critical' || r.severity === 'High').length} High/Critical category risks to compress mean response window below 14 days.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Directive 3 · Insurance & Transfer</span>
            <h4 className="text-xs font-extrabold text-slate-900">Risk Transfer Optimization</h4>
            <p className="text-[11px] text-slate-600">
              Evaluate cyber liability & third-party SLA indemnity contracts to offload up to 40% of unmitigated residual liability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
