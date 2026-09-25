'use client';

import React from 'react';
import { CascadePropagationGraph } from '../../components/risks/CascadePropagationGraph';

export default function CascadePage() {
  return (
    <div className="space-y-6 animate-in fade-in-50 pb-12">
      <CascadePropagationGraph />
    </div>
  );
}
