import React, { useState } from 'react';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function InviteUserModal({ isOpen, onClose }: InviteUserModalProps) {
  const [formData, setFormData] = useState({ email: '', role: 'Operator' });
  const queryClient = useQueryClient();

  const inviteUserMutation = useMutation({
    mutationFn: (data: { email: string; role: string }) => 
        axios.post(`${API_BASE}/api/security/users/invite`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security_users'] });
      queryClient.invalidateQueries({ queryKey: ['security_logs'] });
      setFormData({ email: '', role: 'Operator' }); // reset
      onClose();
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#040D21] border border-slate-800 p-6 rounded-xl w-96 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Invite New Personnel</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 uppercase font-semibold">Email Address</label>
            <input 
              type="email" 
              className="mt-1.5 w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="user@organization.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 uppercase font-semibold">Assign Role</label>
            <select 
              className="mt-1.5 w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="Operator">Operator</option>
              <option value="Viewer">Viewer</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg font-medium transition-colors">
            Cancel
          </button>
          <button 
            onClick={() => inviteUserMutation.mutate(formData)} 
            disabled={inviteUserMutation.isPending || !formData.email}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {inviteUserMutation.isPending ? 'Sending...' : 'Send Invite'}
          </button>
        </div>
      </div>
    </div>
  );
}
