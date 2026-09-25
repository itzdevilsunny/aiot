'use client';

import React, { useState } from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { Button } from '../ui/Button';
import { 
  ShieldCheck, 
  Check, 
  X, 
  Users, 
  KeyRound, 
  Lock, 
  Sparkles,
  Save
} from 'lucide-react';

interface RolePermission {
  roleName: string;
  description: string;
  createRisk: boolean;
  editRisk: boolean;
  approveMitigation: boolean;
  deleteRisk: boolean;
  exportReports: boolean;
  configureSettings: boolean;
}

const INITIAL_RBAC: RolePermission[] = [
  {
    roleName: 'CISO / Risk Executive',
    description: 'Full workspace administration and governance approval authority.',
    createRisk: true,
    editRisk: true,
    approveMitigation: true,
    deleteRisk: true,
    exportReports: true,
    configureSettings: true
  },
  {
    roleName: 'Enterprise Risk Manager',
    description: 'Manages risk register entries, reviews mitigations, and runs Monte Carlo simulations.',
    createRisk: true,
    editRisk: true,
    approveMitigation: true,
    deleteRisk: false,
    exportReports: true,
    configureSettings: false
  },
  {
    roleName: 'Lead Engineer / Risk Owner',
    description: 'Assigned threat owner responsible for executing checklist action items.',
    createRisk: true,
    editRisk: true,
    approveMitigation: false,
    deleteRisk: false,
    exportReports: true,
    configureSettings: false
  },
  {
    roleName: 'Compliance Auditor',
    description: 'Read-only access for internal/external ISO 31000 and SOC 2 evidence verification.',
    createRisk: false,
    editRisk: false,
    approveMitigation: false,
    deleteRisk: false,
    exportReports: true,
    configureSettings: false
  }
];

export const RBACPermissionMatrix: React.FC = () => {
  const { addToast } = useRiskContext();
  const [permissions, setPermissions] = useState<RolePermission[]>(INITIAL_RBAC);

  const togglePermission = (roleIdx: number, permKey: keyof Omit<RolePermission, 'roleName' | 'description'>) => {
    setPermissions(prev => prev.map((role, idx) => {
      if (idx !== roleIdx) return role;
      return {
        ...role,
        [permKey]: !role[permKey]
      };
    }));
  };

  const handleSaveMatrix = () => {
    addToast('RBAC Policy Saved', 'Role permissions synchronized across workspace.', 'success');
  };

  return (
    <div className="space-y-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-card">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-600" />
            <span>Enterprise Role-Based Access Control (RBAC) & Governance Matrix</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure permission scopes for CISOs, Risk Managers, Engineering Leads, and Compliance Auditors.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Save className="w-3.5 h-3.5" />}
          onClick={handleSaveMatrix}
        >
          Save Policy
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="p-3">User Role Persona</th>
              <th className="p-3 text-center">Create Risk</th>
              <th className="p-3 text-center">Edit Record</th>
              <th className="p-3 text-center">Approve Mitigation</th>
              <th className="p-3 text-center">Delete Risk</th>
              <th className="p-3 text-center">Export Reports</th>
              <th className="p-3 text-center">Admin Settings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {permissions.map((p, idx) => (
              <tr key={p.roleName} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3 max-w-xs">
                  <div className="font-bold text-slate-900">{p.roleName}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{p.description}</div>
                </td>

                {(['createRisk', 'editRisk', 'approveMitigation', 'deleteRisk', 'exportReports', 'configureSettings'] as const).map(key => (
                  <td key={key} className="p-3 text-center">
                    <button
                      onClick={() => togglePermission(idx, key)}
                      className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition-all cursor-pointer ${
                        p[key] ? 'bg-emerald-100 text-emerald-700 font-bold' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {p[key] ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
