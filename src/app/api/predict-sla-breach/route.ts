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

    // 2. Dynamic Fallback
    const progress = risk.mitigationProgress || 0;
    const isBreached = progress < 30 && (risk.severity === 'Critical' || risk.severity === 'High');

    return NextResponse.json({
      slaViolationProbability: isBreached ? 82 : 28,
      predictedBreachDays: isBreached ? 4 : 21,
      riskLevel: isBreached ? 'High Risk of Breach' : 'Low Risk of Breach',
      recommendations: [
        `Reassign secondary backup owner (Ritika - Product Manager or Yash Raj) to assist ${risk.ownerName || 'Sunny Prasad'}.`,
        'Automate daily progress reminders via Slack webhook.',
        'Request 14-day SLA review window extension from Enterprise Risk Officer.'
      ],
      suggestedBackupOwner: 'Ritika (Product Manager & Strategic Execution Lead)',
      source: 'Dynamic Context Engine'
    });
  } catch (error: any) {
    console.error('SLA API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
