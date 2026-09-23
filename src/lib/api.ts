import { AIRiskAnalysisResult, RiskItem } from '../types/risk';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://risk-register-copilot.onrender.com';

/**
 * Call the Gemini AI Risk Analysis API (/api/analyze-risk) or Render backend API
 */
export async function analyzeRiskWithAI(
  naturalLanguagePrompt: string
): Promise<AIRiskAnalysisResult | null> {
  // 1. First try native Gemini API route (/api/analyze-risk)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch('/api/analyze-risk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: naturalLanguagePrompt }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const res = await response.json();
      if (res && res.title) {
        return res;
      }
    }
  } catch (err) {
    // Fallthrough to Render Backend API
  }

  // 2. Try Render Backend API
  const endpoints = [
    `${BACKEND_URL}/api/analyze-risk`,
    `${BACKEND_URL}/api/analyze`,
    `${BACKEND_URL}/analyze`
  ];

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: naturalLanguagePrompt, text: naturalLanguagePrompt }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && (data.title || data.category || data.result)) {
          const res = data.result || data;
          return {
            title: res.title || 'Identified Project Operational Risk',
            description: naturalLanguagePrompt,
            category: res.category || 'Technical',
            probability: res.probability || 4,
            impact: res.impact || 4,
            score: (res.probability || 4) * (res.impact || 4),
            severity: res.severity || 'High',
            suggestedOwnerName: res.suggestedOwnerName || res.owner_name || 'Sunny Prasad',
            suggestedOwnerRole: res.suggestedOwnerRole || res.owner_role || 'Business Operations Intern',
            mitigationPlan: res.mitigationPlan || res.mitigation_plan || 'Conduct technical discovery spike and isolate root dependencies.',
            contingencyPlan: res.contingencyPlan || res.contingency_plan || 'Activate backup server pool and apply feature flags.',
            aiConfidence: res.aiConfidence || 95,
            estimatedImpactUsd: res.estimatedImpactUsd || 25000
          };
        }
      }
    } catch (err) {
      // Continue
    }
  }

  return null;
}

export async function checkRenderBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeoutId);
    return res !== null && (res.ok || res.status === 200 || res.status === 404);
  } catch (err) {
    return false;
  }
}

export async function syncRiskToRenderBackend(risk: RiskItem): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/risks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(risk)
    }).catch(() => null);

    return res !== null && res.ok;
  } catch (err) {
    return false;
  }
}

export async function updateRiskOnRenderBackend(id: string, updates: Partial<RiskItem>): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/risks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).catch(() => null);

    return res !== null && res.ok;
  } catch (err) {
    return false;
  }
}

export async function deleteRiskFromRenderBackend(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/risks/${id}`, {
      method: 'DELETE'
    }).catch(() => null);

    return res !== null && res.ok;
  } catch (err) {
    return false;
  }
}
