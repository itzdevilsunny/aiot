import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  let body: any = {};
  try {
    body = await request.json();
  } catch (e) {
    body = {};
  }

  const risks = Array.isArray(body.risks) ? body.risks : [];

  const groqApiKey = process.env.GROQ_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  const totalRisks = risks.length;
  const criticalCount = risks.filter((r: any) => r && (r.severity === 'Critical' || r.score >= 17)).length;
  const highCount = risks.filter((r: any) => r && (r.severity === 'High' || (r.score >= 10 && r.score < 17))).length;
  const totalExposure = risks.reduce((acc: number, r: any) => acc + (Number(r?.estimatedImpactUsd) || (r?.score ? r.score * 2500 : 15000)), 0);

  const prompt = `
You are the Chief Risk Officer and AI Operations Advisor at MNB Research · Business Operations.
Synthesize an executive briefing for the leadership team based on the following live project risk register summary:

- Total Active Risks: ${totalRisks}
- Critical Severity (Score >= 17): ${criticalCount}
- High Severity (Score 10-16): ${highCount}
- Total Estimated Financial Exposure: $${totalExposure.toLocaleString()} USD
- Risk Items:
${risks.slice(0, 8).map((r: any) => `- [${r.id || 'RSK'}] ${r.title || 'Risk'} (Category: ${r.category || 'Operational'}, Score: ${r.score || 10}, Status: ${r.status || 'Open'}, Owner: ${r.ownerName || 'Lead'})`).join('\n')}

Generate a JSON object containing:
1. "executiveSummary": A crisp, professional 2-sentence executive summary of the overall risk posture for MNB Research.
2. "topPriorityActions": An array of exactly 3 strategic action items formatted as strings.
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

  // 1. Try Groq LLaMA 3.3 70B Engine (Sub 200ms)
  if (groqApiKey && groqApiKey.trim().length > 10) {
    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.2
        })
      });

      if (groqRes.ok) {
        const groqData = await groqRes.json();
        const contentStr = groqData.choices?.[0]?.message?.content?.trim();
        if (contentStr) {
          const parsed = JSON.parse(contentStr);
          return NextResponse.json(sanitizeResponse(parsed));
        }
      }
    } catch (err: any) {
      console.warn('Groq briefing note:', err?.message || err);
    }
  }

  // 2. Try Gemini fallback
  if (geminiApiKey && geminiApiKey.trim().length > 10) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = response.text || '';
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanText);
      return NextResponse.json(sanitizeResponse(parsed));
    } catch (err: any) {
      console.warn('Gemini briefing note:', err?.message || err);
    }
  }

  // 3. Guaranteed Safe Fallback Output
  return NextResponse.json(sanitizeResponse(null));
}
