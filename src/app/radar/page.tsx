'use client';

import React from 'react';
import { PredictiveRiskRadar } from '../../components/analytics/PredictiveRiskRadar';

export default function RadarPage() {
  return (
    <div className="space-y-6 animate-in fade-in-50 pb-12">
      <PredictiveRiskRadar />
    </div>
  );
}
