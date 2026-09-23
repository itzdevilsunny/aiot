'use client';

import React from 'react';
import { Project } from '../../types/risk';
import { useRiskContext } from '../../context/RiskContext';
import { FolderKanban, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const router = useRouter();
  const { risks, setSelectedProjectId } = useRiskContext();

  const projectRisks = risks.filter(r => r.projectId === project.id);
  const criticalCount = projectRisks.filter(r => r.severity === 'Critical').length;
  const highCount = projectRisks.filter(r => r.severity === 'High').length;

  const totalProgress = projectRisks.length > 0 
    ? Math.round(projectRisks.reduce((acc, r) => acc + r.mitigationProgress, 0) / projectRisks.length)
    : 100;

  const handleOpenProject = () => {
    setSelectedProjectId(project.id);
    router.push('/register');
  };

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-md transition-all flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              <FolderKanban className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{project.name}</h3>
              <span className="text-[10px] font-mono font-semibold text-slate-400">{project.code}</span>
            </div>
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            project.status === 'On Track' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
            project.status === 'At Risk' ? 'bg-red-50 text-red-700 border border-red-200' :
            'bg-slate-100 text-slate-700'
          }`}>
            {project.status}
          </span>
        </div>

        <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
          {project.description}
        </p>
      </div>

      {/* Stats Breakdown Grid */}
      <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Risks</span>
          <div className="text-lg font-bold text-slate-900 mt-0.5">{projectRisks.length}</div>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Critical/High</span>
          <div className="text-lg font-bold text-red-700 mt-0.5">{criticalCount + highCount}</div>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Progress</span>
          <div className="text-lg font-bold text-emerald-700 mt-0.5">{totalProgress}%</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
          <span>Mitigation Readiness</span>
          <span>{totalProgress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-600 transition-all duration-300"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-500">Lead: <strong>{project.leadName}</strong></span>
        <button
          onClick={handleOpenProject}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
        >
          <span>Open Register</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
