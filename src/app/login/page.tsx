'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRiskContext } from '../../context/RiskContext';
import { Lock, Mail, Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, teamMembers, addToast } = useRiskContext();

  const [emailInput, setEmailInput] = useState('sunny.prasad@mnbresearch.com');
  const [passwordInput, setPasswordInput] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      addToast('Email Required', 'Please enter your corporate email.', 'error');
      return;
    }
    if (!passwordInput.trim()) {
      addToast('Password Required', 'Please enter your authentication password.', 'error');
      return;
    }

    setIsLoading(true);
    setTimeout(async () => {
      const success = await login(emailInput.trim(), passwordInput.trim());
      setIsLoading(false);
      if (success) {
        router.push('/');
      }
    }, 400);
  };

  const handleQuickSwitch = (memberEmail: string) => {
    setEmailInput(memberEmail);
    setPasswordInput('password123');
    setIsLoading(true);
    setTimeout(async () => {
      const success = await login(memberEmail, 'password123');
      setIsLoading(false);
      if (success) {
        router.push('/');
      }
    }, 350);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0d14] text-white selection:bg-sky-500 selection:text-white animate-in fade-in-50">
      <div className="w-full max-w-[400px] bg-[#111726] border border-slate-800/80 rounded-2xl shadow-2xl p-7 sm:p-8 space-y-4 relative">
        
        {/* Top Key Icon Badge */}
        <div className="w-12 h-12 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-center mx-auto text-sky-400 shadow-inner mb-2">
          <KeyRound className="w-5 h-5 text-sky-400" />
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-white tracking-tight">
            Risk Register Copilot
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Secure Decisioning & Enterprise Risk Portal
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          {/* Email Address */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
              EMAIL ADDRESS
            </label>
            <div className="bg-[#0c101a] border border-slate-800 focus-within:border-sky-500/80 rounded-lg p-2.5 flex items-center gap-2.5 transition-colors">
              <Mail className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="officer@mnbresearch.com"
                className="w-full bg-transparent text-xs text-white placeholder:text-slate-600 focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
              PASSWORD
            </label>
            <div className="bg-[#0c101a] border border-slate-800 focus-within:border-sky-500/80 rounded-lg p-2.5 flex items-center gap-2.5 transition-colors">
              <Lock className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-xs text-white placeholder:text-slate-600 focus:outline-none font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-500 hover:text-slate-300 transition-colors shrink-0"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Primary CTA */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 active:scale-[0.99] text-slate-950 font-bold text-xs rounded-lg shadow-md transition-all cursor-pointer mt-3 disabled:opacity-60"
          >
            {isLoading ? 'Authenticating Credentials...' : 'Authenticate Credentials'}
          </button>
        </form>

        {/* Quick Demo Access Divider */}
        <div className="relative flex items-center justify-center my-3.5 pt-1">
          <div className="border-t border-slate-800/80 w-full" />
          <span className="bg-[#111726] px-2.5 text-[9px] font-bold text-slate-500 tracking-widest uppercase absolute">
            QUICK DEMO ACCESS
          </span>
        </div>

        {/* 3 Quick Role Demo Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => handleQuickSwitch('sunny.prasad@mnbresearch.com')}
            className={`py-2 px-1 border rounded-lg text-[10px] font-bold tracking-wider uppercase transition-colors text-center cursor-pointer truncate ${
              emailInput.toLowerCase() === 'sunny.prasad@mnbresearch.com'
                ? 'border-sky-500/80 bg-sky-950/40 text-sky-300'
                : 'border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Sunny Prasad - Business Operations Lead"
          >
            RISK LEAD
          </button>

          <button
            type="button"
            onClick={() => handleQuickSwitch('sumit@mnbresearch.com')}
            className={`py-2 px-1 border rounded-lg text-[10px] font-bold tracking-wider uppercase transition-colors text-center cursor-pointer truncate ${
              emailInput.toLowerCase() === 'sumit@mnbresearch.com'
                ? 'border-sky-500/80 bg-sky-950/40 text-sky-300'
                : 'border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Sumit - Resource & Risk Manager"
          >
            RISK MGR
          </button>

          <button
            type="button"
            onClick={() => handleQuickSwitch('devyash@mnbresearch.com')}
            className={`py-2 px-1 border rounded-lg text-[10px] font-bold tracking-wider uppercase transition-colors text-center cursor-pointer truncate ${
              emailInput.toLowerCase() === 'devyash@mnbresearch.com'
                ? 'border-sky-500/80 bg-sky-950/40 text-sky-300'
                : 'border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Devyash - Data Quality & Audit Analyst"
          >
            AUDITOR
          </button>
        </div>

        {/* Footer Security & Engine Telemetry Badge */}
        <div className="pt-3 border-t border-slate-800/60 space-y-1.5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Validated by Supabase Auth Gateway</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-slate-500">
            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              risk-register-copilot-1.onrender.com
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
