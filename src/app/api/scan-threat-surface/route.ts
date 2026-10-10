import { NextRequest, NextResponse } from 'next/server';
import { callGroqAI } from '@/lib/groq';
import { callGeminiAI } from '@/lib/gemini';
import { getRisks } from '@/lib/server/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let { risks } = body;

    if (!risks || !Array.isArray(risks) || risks.length === 0) {
      risks = getRisks();
    }

    const activeRisks = (risks || []).filter((r: any) => r.status !== 'Closed');

    const systemInstruction = `You are a Principal Security Architect and Offensive Cyber Red Teamer for MNB Research.
Perform a comprehensive Enterprise Cyber Threat Surface & Attack Surface Scan on live risk register data:

Active Risks (${activeRisks.length} items):
${JSON.stringify(activeRisks.map((r: any) => ({
  id: r.id,
  title: r.title,
  category: r.category,
  severity: r.severity,
  likelihood: r.likelihood || r.probability,
  impact: r.impact,
  ownerName: r.ownerName,
  mitigationProgress: r.mitigationProgress
})), null, 2)}

Evaluate exposure across 6 core attack surface domains:
1. API Gateway & Network Security (VEC-1)
2. Identity & Access Management - IAM (VEC-2)
3. Database Encryption & Storage Security (VEC-3)
4. Third-Party SaaS Vendor Supply Chain (VEC-4)
5. CI/CD Build Pipeline Security (VEC-5)
6. Data Privacy & GDPR Regulatory Guard (VEC-6)

Return a strict JSON object with:
1. "overallScore": integer 0-100 (0 = fully hardened, 100 = critical breach risk).
2. "postureRating": "Strong" | "Moderate" | "Elevated Risk" | "Critical Vulnerability".
3. "executiveSummary": string summarizing current attack surface posture and key attack vectors for leadership (Sunny Prasad, Yash Raj, Ritika).
4. "vectors": array of 6 domain objects:
   - "id": string ("VEC-1" through "VEC-6")
   - "name": string
   - "category": string
   - "score": integer 0-100 exposure score
   - "threatLevel": "Critical" | "High" | "Medium" | "Low"
   - "cveReferences": string[] (e.g. ["CVE-2024-3094", "CVE-2023-4863"])
   - "recommendation": actionable security hardening runbook paragraph
5. "hardeningRunbook": array of step-by-step priority security hardening tasks to execute.

Respond ONLY with valid JSON.`;

    // 1. Primary: Groq Qwen (qwen/qwen3.8-27b)
    const groqResult = await callGroqAI({
      messages: [{ role: 'user', content: systemInstruction }],
      jsonMode: true,
      temperature: 0.2
    });

    if (groqResult.success && groqResult.content) {
      try {
        const parsed = JSON.parse(groqResult.content);
        if (parsed && parsed.overallScore !== undefined) {
          return NextResponse.json({
            ...parsed,
            provider: `Groq (${groqResult.model})`
          });
        }
      } catch (err) {
        console.warn('Groq Threat Surface Scan parse note:', err);
      }
    }

    // 2. Secondary: Google Gemini 3.8 Flash
    const geminiResult = await callGeminiAI({
      prompt: systemInstruction,
      jsonMode: true,
      temperature: 0.2
    });

    if (geminiResult.success && geminiResult.content) {
      try {
        const parsed = JSON.parse(geminiResult.content);
        if (parsed && parsed.overallScore !== undefined) {
          return NextResponse.json({
            ...parsed,
            provider: `Google Gemini (${geminiResult.model})`
          });
        }
      } catch (err) {
        console.warn('Gemini Threat Surface Scan parse note:', err);
      }
    }

    // If neither provider succeeded, return an honest error
    return NextResponse.json(
      {
        error: 'AI threat surface scan service temporarily unavailable.',
        details: 'Neither Groq nor Google Gemini could generate a multi-vector threat surface assessment.',
        groqStatus: groqResult.error || (groqResult.success ? 'Invalid structured output' : 'Provider call failed'),
        geminiStatus: geminiResult.error || (geminiResult.success ? 'Invalid structured output' : 'Provider call failed')
      },
      { status: 503 }
    );
  } catch (error: any) {
    console.error('Threat Surface Scan API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
