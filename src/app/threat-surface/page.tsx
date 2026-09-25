'use client';

import React from 'react';
import { SecurityThreatSurface } from '../../components/analytics/SecurityThreatSurface';

export default function ThreatSurfacePage() {
  return (
    <div className="space-y-6 animate-in fade-in-50 pb-12">
      <SecurityThreatSurface />
    </div>
  );
}
