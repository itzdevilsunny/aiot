import React from 'react';
import Link from 'next/link';
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
  href?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  trend,
  icon,
  iconBg = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  href
}) => {
  const content = (
    <div className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-card hover-lift transition-all ${href ? 'hover:border-indigo-400 dark:hover:border-indigo-500 cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
        <div className={`p-2.5 rounded-xl text-sm shadow-2xs ${iconBg}`}>
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-mono-code">{value}</span>
        {subValue && (
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{subValue}</span>
        )}
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {trend.type === 'positive' && <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
          {trend.type === 'negative' && <TrendingDown className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />}
          {trend.type === 'neutral' && <Minus className="w-3.5 h-3.5 text-slate-400" />}
          <span className={`font-bold ${
            trend.type === 'positive' ? 'text-emerald-700 dark:text-emerald-400' :
            trend.type === 'negative' ? 'text-red-700 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'
          }`}>
            {trend.text}
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
};
