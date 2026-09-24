'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRiskContext } from '../../context/RiskContext';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, UserCheck, KeyRound, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const { login, teamMembers, currentUser, addToast } = useRiskContext();

  const [emailInput, setEmailInput] = useState('sunny.prasad@mnbresearch.com');
  const [passwordInput, setPasswordInput] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      login(emailInput.trim(), passwordInput);
      setIsLoading(false);
      router.push('/dashboard');
    }, 600);
  };

  const handleQuickSwitch = (memberEmail: string) => {
    setEmailInput(memberEmail);
    setPasswordInput('password123');
    login(memberEmail, 'password123');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 animate-in fade-in-50">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-8 space-y-6">
        
        {/* Top Branding Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>

          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-1.5">
              <span>Risk Register Copilot</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-indigo-100 text-indigo-700">
                SSO Auth
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              MNB Research · Enterprise Operations Portal
            </p>
          </div>
        </div>

        {/* Currently Logged In Session Pill */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 truncate">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
            <div className="truncate">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Active Session</span>
              <h4 className="font-bold text-slate-900 truncate">{currentUser.name}</h4>
            </div>
          </div>

          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase shrink-0">
            Authenticated
          </span>
        </div>

        {/* 1-Click Quick Enterprise Account Switcher */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
            Quick 1-Click Enterprise User Switcher
          </span>

          <div className="space-y-1.5">
            {teamMembers.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => handleQuickSwitch(member.email)}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  currentUser.email.toLowerCase() === member.email.toLowerCase()
                    ? 'bg-indigo-900 text-white border-indigo-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src={member.avatar} alt={member.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                  <div className="truncate">
                    <div className="text-xs font-bold truncate">{member.name}</div>
                    <div className={`text-[10px] truncate ${currentUser.email.toLowerCase() === member.email.toLowerCase() ? 'text-indigo-200' : 'text-slate-500'}`}>
                      {member.role}
                    </div>
                  </div>
                </div>

                <UserCheck className={`w-4 h-4 shrink-0 ${currentUser.email.toLowerCase() === member.email.toLowerCase() ? 'text-emerald-400' : 'text-slate-400'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Manual Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Corporate Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="name@mnbresearch.com"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2"
            icon={<Lock className="w-4 h-4" />}
          >
            {isLoading ? 'Authenticating...' : 'Sign In to Operations Workspace'}
          </Button>
        </form>

        {/* Footer Security Badge */}
        <div className="text-center pt-2">
          <span className="text-[10px] text-slate-400 font-mono flex items-center justify-center gap-1">
            <Lock className="w-3 h-3 text-emerald-500" />
            SOC2 Type II Authenticated Session · MNB Research
          </span>
        </div>
      </div>
    </div>
  );
}
