'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShieldAlert, Sparkles, FolderKanban, Users, ArrowRight, X } from 'lucide-react';
import { useRiskContext } from '../../context/RiskContext';
import { Badge } from '../ui/Badge';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandMenu: React.FC<CommandMenuProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { risks, projects, teamMembers } = useRiskContext();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredRisks = risks.filter(r => 
    r.title.toLowerCase().includes(query.toLowerCase()) ||
    r.id.toLowerCase().includes(query.toLowerCase()) ||
    r.category.toLowerCase().includes(query.toLowerCase()) ||
    r.ownerName.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredMembers = teamMembers.filter(m => 
    m.name.toLowerCase().includes(query.toLowerCase()) ||
    m.role.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in-50">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
        {/* Search Header Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100">
          <Search className="w-4 h-4 text-slate-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a risk ID, title, project, owner, or category..."
            className="flex-1 text-sm bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 font-medium"
            autoFocus
          />
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Shortcuts */}
        <div className="p-3 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shortcuts:</span>
          <button
            onClick={() => {
              router.push('/add');
              onClose();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-indigo-600 font-semibold hover:bg-indigo-50"
          >
            <Sparkles className="w-3 h-3 text-indigo-500" /> ✨ AI Risk Analyzer
          </button>
          <button
            onClick={() => {
              router.push('/register');
              onClose();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-100"
          >
            <ShieldAlert className="w-3 h-3 text-slate-500" /> Risk Register
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 text-left">
          {/* Risks */}
          {filteredRisks.length > 0 && (
            <div>
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Risk Register Items ({filteredRisks.length})
              </div>
              <div className="space-y-1">
                {filteredRisks.map(risk => (
                  <button
                    key={risk.id}
                    onClick={() => {
                      router.push(`/risk/${risk.id}`);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 transition-colors group text-left"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-xs font-mono font-bold text-slate-500 mt-0.5">{risk.id}</span>
                      <div className="truncate">
                        <div className="text-xs font-semibold text-slate-900 truncate group-hover:text-indigo-600">
                          {risk.title}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{risk.category}</span>
                          <span>•</span>
                          <span>Owner: {risk.ownerName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge severity={risk.severity} />
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {filteredProjects.length > 0 && (
            <div>
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Projects ({filteredProjects.length})
              </div>
              <div className="space-y-1">
                {filteredProjects.map(proj => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      router.push('/projects');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <FolderKanban className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-xs font-semibold text-slate-900">{proj.name}</div>
                        <div className="text-[11px] text-slate-500">{proj.totalRisks} risks total • Lead: {proj.leadName}</div>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-indigo-600">{proj.mitigationProgress}% mitigations</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Team Members */}
          {filteredMembers.length > 0 && (
            <div>
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Team Members ({filteredMembers.length})
              </div>
              <div className="space-y-1">
                {filteredMembers.map(member => (
                  <button
                    key={member.id}
                    onClick={() => {
                      router.push('/team');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full object-cover" />
                      <div>
                        <div className="text-xs font-semibold text-slate-900">{member.name}</div>
                        <div className="text-[11px] text-slate-500">{member.role} • {member.department}</div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">{member.assignedRisksCount} risks assigned</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredRisks.length === 0 && filteredProjects.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-500">
              No matching risks or projects found for &quot;{query}&quot;.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
