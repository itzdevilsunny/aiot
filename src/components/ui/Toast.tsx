'use client';

import React from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { CheckCircle2, AlertCircle, Info, X, ShieldAlert } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useRiskContext();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map(toast => {
        let Icon = Info;
        let borderColor = 'border-slate-200';
        let iconColor = 'text-indigo-600';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          borderColor = 'border-emerald-200 bg-emerald-50/90';
          iconColor = 'text-emerald-600';
        } else if (toast.type === 'warning') {
          Icon = ShieldAlert;
          borderColor = 'border-amber-200 bg-amber-50/90';
          iconColor = 'text-amber-600';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          borderColor = 'border-red-200 bg-red-50/90';
          iconColor = 'text-red-600';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl bg-white shadow-popover border ${borderColor} transition-all duration-200 animate-in slide-in-from-bottom-3`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 text-left">
              <h4 className="text-xs font-semibold text-slate-900">{toast.title}</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
