'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRiskContext } from '../../context/RiskContext';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, UserCheck, KeyRound } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const { login, teamMembers, currentUser, isAuthenticated, addToast } = useRiskContext();

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
      addToast('Password Required', 'Please enter your password to authenticate.', 'error');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const success = login(emailInput.trim(), passwordInput.trim());
      setIsLoading(false);
      if (success) {
        router.push('/dashboard');
      }
    }, 500);
  };

  const handleQuickSwitch = (memberEmail: string) => {
    setEmailInput(memberEmail);
    setPasswordInput('password123');
    setIsLoading(true);
    setTimeout(() => {
      const success = login(memberEmail, 'password123');
      setIsLoading(false);
      if (success) {
        router.push('/dashboard');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 animate-in fade-in-50">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        
        {/* Top Decorative Glow */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-600 to-purple-600" />

        {/* Top Branding Header */}
        <div className="text-center space-y-2 pt-1">
          <div className="w-13 h-13 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-lg">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
          </div>

          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-2">
              <span>Risk Register Copilot</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-indigo-100 text-indigo-700">
                SSO Auth
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              MNB Research · Business Operations Portal
            </p>
          </div>
        </div>

        {/* Session Status Pill */}
        <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-colors ${
          isAuthenticated 
            ? 'bg-emerald-50/80 border-emerald-200' 
            : 'bg-amber-50/80 border-amber-200'
        }`}>
          <div className="flex items-center gap-2.5 truncate">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
            <div className="truncate">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                {isAuthenticated ? 'Active User Session' : 'Authentication Required'}
              </span>
              <h4 className="font-bold text-slate-900 truncate">{currentUser.name}</h4>
            </div>
          </div>

          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase shrink-0 flex items-center gap-1 ${
            isAuthenticated 
              ? 'bg-emerald-100 text-emerald-800' 
              : 'bg-amber-100 text-amber-800'
          }`}>
            <Lock className="w-3 h-3" />
            {isAuthenticated ? 'Authenticated' : 'Locked'}
          </span>
        </div>

        {/* Quick Enterprise Account Switcher */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
            Select Enterprise Team Persona
          </span>

          <div className="space-y-1.5">
            {teamMembers.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => handleQuickSwitch(member.email)}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  emailInput.toLowerCase() === member.email.toLowerCase()
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src={member.avatar} alt={member.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                  <div className="truncate">
                    <div className="text-xs font-bold truncate">{member.name}</div>
                    <div className={`text-[10px] truncate ${emailInput.toLowerCase() === member.email.toLowerCase() ? 'text-slate-300' : 'text-slate-500'}`}>
                      {member.role}
                    </div>
                  </div>
                </div>

                <UserCheck className={`w-4 h-4 shrink-0 ${emailInput.toLowerCase() === member.email.toLowerCase() ? 'text-emerald-400' : 'text-slate-400'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Manual Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2 border-t border-slate-100 text-xs">
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
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Authentication Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password..."
                className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
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
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            icon={<Lock className="w-4 h-4 text-indigo-200" />}
          >
            {isLoading ? 'Authenticating Credentials...' : 'Sign In to Operations Workspace'}
          </Button>
        </form>

        {/* Footer Security Badge */}
        <div className="text-center pt-1">
          <span className="text-[10px] text-slate-400 font-mono flex items-center justify-center gap-1">
            <Lock className="w-3 h-3 text-emerald-500" />
            SOC2 Type II Authenticated Session · MNB Research
          </span>
        </div>
      </div>
    </div>
  );
}
