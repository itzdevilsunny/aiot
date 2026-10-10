import { NextRequest, NextResponse } from 'next/server';
import { callGroqAI } from '@/lib/groq';

export async function POST(req: NextRequest) {
  try {
    const { risk, defaultSlaDays = 30 } = await req.json();

    if (!risk || !risk.title) {
      return NextResponse.json({ error: 'Risk object required' }, { status: 400 });
    }

    const prompt = `You are an Enterprise SLA Reliability Officer for MNB Research. Predict the SLA breach risk for this item:
Title: "${risk.title}"
Category: "${risk.category}"
Severity: "${risk.severity}"
Current Progress: ${risk.mitigationProgress || 0}%
Owner: "${risk.ownerName || 'Sunny Prasad'}" (${risk.ownerRole || 'Lead'})
Default Review SLA: ${defaultSlaDays} days

Team Context:
- Sunny Prasad: Business Operations Intern & Risk Lead
- Yash Raj: Operations Lead
- Ritika: Product Manager
- Sumit: Resource Manager
- Priya Sharma: Compliance & Audit Lead

Predict SLA violation probability % (0-100), estimated days remaining until SLA breach, breach risk level, and 3 actionable mitigation steps to prevent SLA failure.

Respond ONLY with a valid JSON object matching this exact structure:
{
  "slaViolationProbability": 0-100 integer,
  "predictedBreachDays": integer days,
  "riskLevel": "High Risk of Breach" | "Moderate Risk" | "Low Risk of Breach",
  "recommendations": ["Step 1", "Step 2", "Step 3"],
  "suggestedBackupOwner": "Name and role of backup leader"
}`;

    // 1. Primary: Groq Qwen (qwen/qwen3.8-27b)
    const groqResult = await callGroqAI({
      messages: [{ role: 'user', content: prompt }],
      jsonMode: true,
      temperature: 0.2
    });

    if (groqResult.success && groqResult.content) {
      try {
        const parsed = JSON.parse(groqResult.content);
        return NextResponse.json({
          ...parsed,
          source: `Groq (${groqResult.model})`
        });
      } catch (e) {
        console.warn('Groq SLA parse note:', e);
      }
    }

    // If provider call did not succeed, return an honest error
    return NextResponse.json(
      {
        error: 'SLA violation prediction service temporarily unavailable.',
        details: 'Neither Groq nor Google Gemini could predict SLA violation milestones.',
        groqStatus: groqResult.error || (groqResult.success ? 'Invalid structured output' : 'Provider call failed')
      },
      { status: 503 }
    );
  } catch (error: any) {
    console.error('SLA API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
