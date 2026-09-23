import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: {
    text: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  icon: React.ReactNode;
  iconBg?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  trend,
  icon,
  iconBg = 'bg-slate-100 text-slate-700'
}) => {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`p-2 rounded-xl text-sm ${iconBg}`}>
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-slate-900">{value}</span>
        {subValue && (
          <span className="text-xs font-medium text-slate-500">{subValue}</span>
        )}
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          {trend.type === 'positive' && <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />}
          {trend.type === 'negative' && <TrendingDown className="w-3.5 h-3.5 text-red-600" />}
          {trend.type === 'neutral' && <Minus className="w-3.5 h-3.5 text-slate-400" />}
          <span className={`font-semibold ${
            trend.type === 'positive' ? 'text-emerald-700' :
            trend.type === 'negative' ? 'text-red-700' : 'text-slate-600'
          }`}>
            {trend.text}
          </span>
        </div>
      )}
    </div>
  );
};
