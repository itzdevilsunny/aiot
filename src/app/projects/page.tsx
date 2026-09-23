'use client';

import React from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { FolderKanban, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function ProjectsPage() {
  const { projects } = useRiskContext();

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-indigo-600" />
            <span>Active Projects & Workstreams</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor risk health, critical density, and mitigation progress across enterprise project initiatives.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => alert("New project workspace modal initialized.")}
        >
          + Create Project
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
