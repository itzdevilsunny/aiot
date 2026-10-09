import { NextResponse } from 'next/server';
import { callGroqAI } from '@/lib/groq';
import { callGeminiAI } from '@/lib/gemini';
import { getRisks } from '@/lib/server/db';

export async function POST(request: Request) {
  let body: any = {};
  try {
    body = await request.json();
  } catch (e) {
    body = {};
  }

  let risks = Array.isArray(body.risks) && body.risks.length > 0 ? body.risks : getRisks();

  const totalRisks = risks.length;
  const criticalCount = risks.filter((r: any) => r && (r.severity === 'Critical' || r.score >= 17)).length;
  const highCount = risks.filter((r: any) => r && (r.severity === 'High' || (r.score >= 10 && r.score < 17))).length;
  const totalExposure = risks.reduce((acc: number, r: any) => acc + (Number(r?.estimatedImpactUsd) || (r?.score ? r.score * 2500 : 15000)), 0);

  const prompt = `
You are the Chief Risk Officer and AI Operations Advisor at MNB Research · Business Operations.
Synthesize an executive briefing for the leadership team (Sunny Prasad, Yash Raj, Ritika, Sumit, Priya Sharma) based on the following live project risk register summary:

- Total Active Risks: ${totalRisks}
- Critical Severity (Score >= 17): ${criticalCount}
- High Severity (Score 10-16): ${highCount}
- Total Estimated Financial Exposure: $${totalExposure.toLocaleString()} USD
- Risk Items:
${risks.slice(0, 10).map((r: any) => `- [${r.id || 'RSK'}] ${r.title || 'Risk'} (Category: ${r.category || 'Operational'}, Score: ${r.score || 10}, Status: ${r.status || 'Open'}, Owner: ${r.ownerName || 'Lead'})`).join('\n')}

Generate a JSON object containing:
1. "executiveSummary": A crisp, professional 2-sentence executive summary of the overall risk posture for MNB Research leadership.
2. "topPriorityActions": An array of exactly 3 strategic action items formatted as strings, explicitly referencing assigned leaders where relevant.
3. "financialVulnerabilityScore": A number from 1 to 100 representing overall financial risk exposure.
4. "governanceRating": A string ('Strong Governance', 'Moderate Exposure', or 'Action Required').

Respond strictly in valid JSON format without markdown code fences.
`;

  const sanitizeResponse = (data: any) => {
    const executiveSummary = data?.executiveSummary || data?.summary || data?.executive_summary || 
      `MNB Research currently tracks ${totalRisks} active project risks (${criticalCount} critical vulnerabilities) with portfolio financial exposure estimated at $${totalExposure.toLocaleString()} USD across core workstreams.`;
    
    let rawActions = data?.topPriorityActions || data?.top_priority_actions || data?.actions || data?.recommendations || [];
    if (!Array.isArray(rawActions)) {
      rawActions = [String(rawActions)];
    }
    
    let topPriorityActions = rawActions.map((a: any) => String(a?.action || a?.title || a)).filter(Boolean);
    if (topPriorityActions.length === 0) {
      topPriorityActions = [
        'Accelerate technical discovery spikes to address key developer capacity constraints before production deployment.',
        'Enforce automated billing alerts at 80% threshold to prevent cloud infrastructure cost variance overruns.',
        'Audit third-party compliance evidence logging policies to maintain SOC2 audit readiness.'
      ];
    }

    const financialVulnerabilityScore = Math.min(100, Math.max(1, Number(data?.financialVulnerabilityScore || data?.vulnerability_score) || (criticalCount > 2 ? 78 : 58)));
    const governanceRating = String(data?.governanceRating || data?.governance_rating || (criticalCount > 2 ? 'Action Required' : 'Moderate Exposure'));

    return {
      executiveSummary,
      topPriorityActions,
      financialVulnerabilityScore,
      governanceRating
    };
  };

  // Primary: Groq Qwen (qwen/qwen3.8-27b)
  const groqResult = await callGroqAI({
    messages: [{ role: 'user', content: prompt }],
    jsonMode: true,
    temperature: 0.2
  });

  if (groqResult.success && groqResult.content) {
    try {
      const parsed = JSON.parse(groqResult.content);
      return NextResponse.json({
        ...sanitizeResponse(parsed),
        provider: `Groq (${groqResult.model})`
      });
    } catch (parseErr) {
      console.warn('Groq briefing parse note:', parseErr);
    }
  }

  // Secondary: Google Gemini 3.8 Flash
  const geminiResult = await callGeminiAI({
    prompt,
    jsonMode: true,
    temperature: 0.2
  });

  if (geminiResult.success && geminiResult.content) {
    try {
      const parsed = JSON.parse(geminiResult.content);
      return NextResponse.json({
        ...sanitizeResponse(parsed),
        provider: `Google Gemini (${geminiResult.model})`
      });
    } catch (parseErr) {
      console.warn('Gemini briefing parse note:', parseErr);
    }
  }

  // Fallback: Dynamic Sanitized Synthesis
  return NextResponse.json({
    ...sanitizeResponse(null),
    provider: 'Dynamic Context Engine'
  });
}
