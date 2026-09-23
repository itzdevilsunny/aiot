import React from 'react';
import { SeverityLevel, StatusLevel } from '../../types/risk';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'severity' | 'status' | 'category' | 'neutral' | 'indigo';
  severity?: SeverityLevel;
  status?: StatusLevel;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'neutral', 
  severity, 
  status, 
  className = '' 
}) => {
  if (severity) {
    switch (severity) {
      case 'Critical':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200/80 shadow-xs ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
            Critical
          </span>
        );
      case 'High':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200/80 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
            High
          </span>
        );
      case 'Medium':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Medium
          </span>
        );
      case 'Low':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Low
          </span>
        );
    }
  }

  if (status) {
    switch (status) {
      case 'Open':
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60 ${className}`}>
            Open
          </span>
        );
      case 'Monitoring':
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/60 ${className}`}>
            Monitoring
          </span>
        );
      case 'Mitigated':
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60 ${className}`}>
            Mitigated
          </span>
        );
      case 'Closed':
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 ${className}`}>
            Closed
          </span>
        );
    }
  }

  if (variant === 'indigo') {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 ${className}`}>
        {children}
      </span>
    );
  }

  if (variant === 'category') {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/70 ${className}`}>
        {children}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}>
      {children}
    </span>
  );
};
