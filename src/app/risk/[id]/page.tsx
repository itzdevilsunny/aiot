'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRiskContext } from '../../../context/RiskContext';
import { RiskDetail } from '../../../components/risks/RiskDetail';
import { Button } from '../../../components/ui/Button';

export default function RiskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { risks } = useRiskContext();

  const riskId = params.id as string;
  const targetRisk = risks.find(r => r.id === riskId);

  if (!targetRisk) {
    return (
      <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-card">
        <h2 className="text-base font-bold text-slate-900">Risk Item Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The requested risk ID &quot;{riskId}&quot; does not exist in the active register.</p>
        <div className="mt-4">
          <Button variant="primary" size="sm" onClick={() => router.push('/register')}>
            Return to Risk Register
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in-50">
      <RiskDetail risk={targetRisk} />
    </div>
  );
}
