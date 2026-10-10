import { NextRequest, NextResponse } from 'next/server';
import { callGroqAI } from '@/lib/groq';
import { callGeminiAI } from '@/lib/gemini';
import { getRisks } from '@/lib/server/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let { risks, framework } = body;

    if (!risks || !Array.isArray(risks) || risks.length === 0) {
      risks = getRisks();
    }

    const activeRisks = (risks || []).filter((r: any) => r.status !== 'Closed');

    const systemInstruction = `You are Priya Sharma, Senior Lead Governance & Compliance Auditor (ISO 27001, ISO 31000, NIST SP 800-30, SOC 2 Type II, GDPR, PCI DSS 4.0) for MNB Research.
Perform a comprehensive AI Compliance & Governance Audit on the live enterprise risk register.

Target Framework Filter: ${framework || 'All Frameworks'}
Active Enterprise Risks (${activeRisks.length} items):
${JSON.stringify(activeRisks.map((r: any) => ({
  id: r.id,
  title: r.title,
  category: r.category,
  severity: r.severity,
  likelihood: r.likelihood || r.probability,
  impact: r.impact,
  mitigationProgress: r.mitigationProgress,
  ownerName: r.ownerName,
  status: r.status
})), null, 2)}

Provide a strict, professional audit report in JSON format with:
1. "healthScore": number between 0 and 100 representing audit readiness.
2. "executiveSummary": string detailing overall governance readiness, strengths, and vulnerabilities for MNB Research leadership (Sunny Prasad, Yash Raj, Ritika).
3. "frameworkScores": object mapping framework names ("ISO 31000", "NIST SP 800-30", "SOC 2 Type II", "GDPR", "PCI DSS 4.0") to numeric scores 0-100.
4. "gaps": array of objects containing:
   - "controlId": string (e.g. "ISO-6.4", "NIST-RA-1", "SOC2-CC6.1", "GDPR-Art32")
   - "framework": string
   - "title": string
   - "severity": "High" | "Medium" | "Low"
   - "issue": detailed description of compliance gap
   - "remediation": actionable step-by-step mitigation task
   - "associatedRiskIds": string[]
5. "auditorMemo": official auditor sign-off statement signed by Priya Sharma (Compliance & Audit Lead).

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
        if (parsed && parsed.healthScore !== undefined) {
          return NextResponse.json({
            ...parsed,
            provider: `Groq (${groqResult.model})`
          });
        }
      } catch (err) {
        console.warn('Groq Compliance Audit JSON parse note:', err);
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
        if (parsed && parsed.healthScore !== undefined) {
          return NextResponse.json({
            ...parsed,
            provider: `Google Gemini (${geminiResult.model})`
          });
        }
      } catch (err) {
        console.warn('Gemini Compliance Audit JSON parse note:', err);
      }
    }

    // If neither provider succeeded, return an honest error
    return NextResponse.json(
      {
        error: 'Compliance audit synthesis service temporarily unavailable.',
        details: 'Neither Groq nor Google Gemini could generate a compliance audit gap assessment.',
        groqStatus: groqResult.error || (groqResult.success ? 'Invalid structured output' : 'Provider call failed'),
        geminiStatus: geminiResult.error || (geminiResult.success ? 'Invalid structured output' : 'Provider call failed')
      },
      { status: 503 }
    );
  } catch (error: any) {
    console.error('Compliance Audit API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
