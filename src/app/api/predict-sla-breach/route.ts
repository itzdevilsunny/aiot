import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { risk, defaultSlaDays = 30 } = await req.json();

    if (!risk || !risk.title) {
      return NextResponse.json({ error: 'Risk object required' }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      const progress = risk.mitigationProgress || 0;
      const isBreached = progress < 30 && risk.severity === 'Critical';

      return NextResponse.json({
        slaViolationProbability: isBreached ? 88 : 35,
        predictedBreachDays: isBreached ? 3 : 18,
        riskLevel: isBreached ? 'High Risk of Breach' : 'Low Risk of Breach',
        recommendations: [
          `Reassign secondary backup owner (${risk.coOwnerName || 'Ritika - Product Lead'}) to assist ${risk.ownerName}.`,
          'Automate daily progress reminders via Slack webhook.',
          'Request 14-day SLA review window extension from Enterprise Risk Officer.'
        ],
        suggestedBackupOwner: risk.coOwnerName || 'Ritika (Product Manager)',
        source: 'fallback'
      });
    }

    const prompt = `You are an Enterprise SLA Reliability Officer. Predict the SLA breach risk for this item:
Title: "${risk.title}"
Category: "${risk.category}"
Severity: "${risk.severity}"
Current Progress: ${risk.mitigationProgress || 0}%
Owner: "${risk.ownerName}" (${risk.ownerRole})
Default Review SLA: ${defaultSlaDays} days

Predict SLA violation probability % (0-100), estimated days remaining until SLA breach, breach risk level, and 3 actionable mitigation steps to prevent SLA failure.

Respond ONLY with a valid JSON object matching this exact structure:
{
  "slaViolationProbability": 0-100 integer,
  "predictedBreachDays": integer days,
  "riskLevel": "High Risk of Breach" | "Moderate Risk" | "Low Risk of Breach",
  "recommendations": ["Step 1", "Step 2", "Step 3"],
  "suggestedBackupOwner": "Name and role of backup engineer"
}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API returned status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return NextResponse.json({
      ...parsed,
      source: 'groq-llama-3.3-70b'
    });
  } catch (error: any) {
    console.error('SLA Predictor API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
