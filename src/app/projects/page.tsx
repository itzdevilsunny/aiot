'use client';

import React, { useState, useMemo } from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { CreateProjectModal } from '../../components/projects/CreateProjectModal';
import { FolderKanban, Plus, BarChart3, ShieldCheck, AlertTriangle, Activity } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function ProjectsPage() {
  const { projects, risks } = useRiskContext();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Compute portfolio comparison metrics
  const portfolioMetrics = useMemo(() => {
    return projects.map(proj => {
      const projRisks = risks.filter(r => r.projectId === proj.id || r.projectName === proj.name);
      const openCount = projRisks.filter(r => r.status === 'Open').length;
      const criticalCount = projRisks.filter(r => r.severity === 'Critical').length;
      const highCount = projRisks.filter(r => r.severity === 'High').length;
      
      const totalExposureUSD = projRisks.reduce((sum, r) => sum + (r.estimatedImpactUsd || r.score * 2500), 0);

      // Risk Health Index (RHI) score calculation (0 to 100)
      const penalty = (criticalCount * 25) + (highCount * 12) + (openCount * 5);
      const bonus = (proj.mitigationProgress || 50) * 0.4;
      const rhiScore = Math.max(10, Math.min(100, Math.round(100 - penalty + bonus)));

      return {
        name: proj.name,
        code: proj.code,
        rhiScore,
        totalRisks: projRisks.length || proj.totalRisks,
        criticalRisks: criticalCount || proj.criticalRisks,
        exposureM: +(totalExposureUSD / 1000000).toFixed(2),
        mitigationProgress: proj.mitigationProgress
      };
    });
  }, [projects, risks]);

  return (
    <div className="space-y-6 animate-in fade-in-50 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-indigo-600" />
            <span>Active Projects & Portfolio Workstreams</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            MNB Research · Monitor risk health, critical density, and mitigation progress across project initiatives.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create Project
        </Button>
      </div>

      {/* Portfolio Health Index & Comparison Visualizer */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>Portfolio Risk Health Index (RHI) & Exposure Comparison</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Comparative rating of project stability (RHI Score 0-100) vs total financial exposure ($ Millions).
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              RHI Health Score (0-100)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              Exposure ($M)
            </span>
          </div>
        </div>

        <div className="h-[260px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={portfolioMetrics} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderRadius: '8px', 
                  color: '#fff', 
                  fontSize: '11px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }} 
              />
              <Bar dataKey="rhiScore" fill="#10b981" radius={[4, 4, 0, 0]} name="Health Index Score" />
              <Bar dataKey="exposureM" fill="#6366f1" radius={[4, 4, 0, 0]} name="Exposure ($M USD)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
