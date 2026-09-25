'use client';

import React, { useState } from 'react';
import { BlockchainLedgerModal } from '../../components/blockchain/BlockchainLedgerModal';
import { Button } from '../../components/ui/Button';
import { Lock, ShieldCheck, Download, CheckCircle2 } from 'lucide-react';

export default function AuditLedgerPage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(true);

  return (
    <div className="space-y-6 animate-in fade-in-50 pb-12">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Blockchain Immutable Risk Ledger Audit Trail
            </h1>
            <p className="text-xs text-slate-500">
              Cryptographic Merkle tree verification engine sealing all state mutations on-chain.
            </p>
          </div>
        </div>

        <Button
          variant="copilot"
          size="sm"
          icon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />}
          onClick={() => setIsModalOpen(true)}
        >
          Open Blockchain Explorer
        </Button>
      </div>

      <BlockchainLedgerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
