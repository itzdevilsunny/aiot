'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuditLedgerPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/audit-logs');
  }, [router]);

  return (
    <div className="p-8 text-center text-xs text-slate-500">
      Redirecting to SOC2 System Audit Trail & Immutable Logs...
    </div>
  );
}
