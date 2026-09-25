'use client';

import React from 'react';
import { KRIMonitoring } from '../../components/analytics/KRIMonitoring';

export default function KRIPage() {
  return (
    <div className="space-y-6 animate-in fade-in-50 pb-12">
      <KRIMonitoring />
    </div>
  );
}
