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
    <div className={`p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all ${href ? 'cursor-pointer group' : ''}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">{label}</span>
        <div className={`p-1.5 rounded-lg text-xs shrink-0 ${iconBg}`}>
          {icon}
        </div>
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 font-mono-code">{value}</span>
          {subValue && (
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">{subValue}</span>
          )}
        </div>

        {trend && (
          <div className="flex items-center gap-1 text-[11px] shrink-0">
            {trend.type === 'positive' && <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
            {trend.type === 'negative' && <TrendingDown className="w-3 h-3 text-red-600 dark:text-red-400" />}
            {trend.type === 'neutral' && <Minus className="w-3 h-3 text-slate-400" />}
            <span className={`font-bold ${
              trend.type === 'positive' ? 'text-emerald-700 dark:text-emerald-400' :
              trend.type === 'negative' ? 'text-red-700 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'
            }`}>
              {trend.text}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
};
