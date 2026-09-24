import { AIRiskAnalysisResult, RiskItem } from '../types/risk';

/**
 * Call the Gemini AI Risk Analysis API (/api/analyze-risk) or proxied Render backend API
 */
export async function analyzeRiskWithAI(
  naturalLanguagePrompt: string,
  imageBase64?: string,
  imageMimeType?: string
): Promise<AIRiskAnalysisResult | null> {
  // 1. Try native Gemini API route (/api/analyze-risk)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch('/api/analyze-risk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt: naturalLanguagePrompt,
        imageBase64,
        imageMimeType
      }),
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
    // Fallthrough to Proxy Route
  }

  // 2. Try proxied Render backend API
  try {
    const response = await fetch('/api/proxy?path=/api/analyze-risk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt: naturalLanguagePrompt, 
        text: naturalLanguagePrompt,
        imageBase64,
        imageMimeType
      })
    });

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
    // Quiet fallback
  }

  return null;
}

export async function checkRenderBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch('/api/proxy?path=/health', { method: 'GET' }).catch(() => null);
    if (!res || !res.ok) return false;
    const data = await res.json().catch(() => null);
    return data && data.status !== 'offline' && data.status !== 'fallback';
  } catch (err) {
    return false;
  }
}

export async function syncRiskToRenderBackend(risk: RiskItem): Promise<boolean> {
  try {
    const res = await fetch('/api/proxy?path=/api/risks', {
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
    const res = await fetch(`/api/proxy?path=/api/risks/${id}`, {
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
    const res = await fetch(`/api/proxy?path=/api/risks/${id}`, {
      method: 'DELETE'
    }).catch(() => null);

    return res !== null && res.ok;
  } catch (err) {
    return false;
  }
}
