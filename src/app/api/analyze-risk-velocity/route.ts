import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { risk } = await req.json();

    if (!risk || !risk.title) {
      return NextResponse.json({ error: 'Risk object required' }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      // Fallback calculations
      const isTechOrSec = risk.category === 'Technical' || risk.category === 'Security';
      const timeToImpactHours = isTechOrSec ? 4 : 48;
      const estimatedMitigationHours = 12;
      const slaBufferHours = timeToImpactHours - estimatedMitigationHours;

      return NextResponse.json({
        velocityCategory: isTechOrSec ? 'Explosive' : 'Rapid',
        timeToImpactHours,
        estimatedMitigationHours,
        slaBufferHours,
        slaStatus: slaBufferHours < 0 ? 'CRITICAL SLA DEFICIT' : slaBufferHours < 12 ? 'WARNING' : 'HEALTHY',
        cascadePathways: [
          `Primary trigger in ${risk.category} infrastructure`,
          `Cascades into customer facing service degradation within ${timeToImpactHours}h`,
          `Financial exposure SLA breach threshold reached`
        ],
        recommendedUrgency: slaBufferHours < 0 ? 'Immediate On-Call Escalation' : 'Standard 24h Review Window',
        source: 'fallback'
      });
    }

    const prompt = `You are an Enterprise Risk Velocity Analyst. Analyze how quickly this threat will manifest and cascade:
Title: "${risk.title}"
Category: "${risk.category}"
Description: "${risk.description}"
Probability: ${risk.probability}/5
Impact: ${risk.impact}/5

Evaluate the risk velocity category (Explosive <1h, Rapid <24h, Moderate 1-7d, Gradual >30d), estimate time to impact in hours, estimate required time to execute full mitigation in hours, and outline the cascading failure pathway.

Respond ONLY with a valid JSON object matching this structure:
{
  "velocityCategory": "Explosive" | "Rapid" | "Moderate" | "Gradual",
  "timeToImpactHours": integer,
  "estimatedMitigationHours": integer,
  "slaBufferHours": integer (timeToImpactHours - estimatedMitigationHours),
  "slaStatus": "CRITICAL SLA DEFICIT" | "WARNING" | "HEALTHY",
  "cascadePathways": ["Step 1", "Step 2", "Step 3"],
  "recommendedUrgency": "Immediate On-Call Escalation" | "24h Priority Review" | "Standard Review Window"
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
    console.error('Risk velocity API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
