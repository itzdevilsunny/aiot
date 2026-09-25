import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { risk } = await req.json();

    if (!risk || !risk.title) {
      return NextResponse.json({ error: 'Risk details missing' }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      return NextResponse.json({
        blindSpots: [
          'Underestimating single point of failure in secondary database failover SLA.',
          'Assumes third-party vendor will provide 24/7 on-call support during holiday freeze.',
          'Missing automated roll-back script execution timing verification.'
        ],
        challengedLikelihood: Math.min(5, (risk.probability || 3) + 1),
        challengedImpact: Math.min(5, (risk.impact || 3) + 1),
        challengedScore: Math.min(25, ((risk.probability || 3) + 1) * ((risk.impact || 3) + 1)),
        strategies: {
          preventative: [
            'Implement mandatory multi-region database read-replica auto-failover.',
            'Enforce zero-trust credential rotation every 14 days.',
            'Contract dedicated SLA extension with primary cloud infrastructure vendor.'
          ],
          detective: [
            'Set up synthetic ping monitors probing API endpoints every 10 seconds.',
            'Deploy anomaly detection rule for uncharacteristic query volume spikes.',
            'Enable continuous real-time audit log streaming to S3 cold storage.'
          ],
          corrective: [
            'Automate snapshot rollback script triggering within 60 seconds of failure.',
            'Activate secondary DNS routing to standby cluster.',
            'Initiate post-mortem incident RCA memo within 24 hours.'
          ]
        },
        source: 'fallback'
      });
    }

    const prompt = `You are an Adversarial Enterprise Security Auditor and Red-Teamer. Stress-test this risk item:
Title: "${risk.title}"
Category: "${risk.category}"
Description: "${risk.description}"
Current Likelihood (1-5): ${risk.probability}
Current Impact (1-5): ${risk.impact}

Provide an aggressive red-team audit evaluation. Identify blind spots, challenge current rating if underestimated, and formulate a 3-tier defense strategy (Preventative, Detective, Corrective).

Respond ONLY with a valid JSON object matching this structure:
{
  "blindSpots": ["string vulnerability 1", "string vulnerability 2", "string vulnerability 3"],
  "challengedLikelihood": 1-5 integer,
  "challengedImpact": 1-5 integer,
  "challengedScore": integer (challengedLikelihood * challengedImpact),
  "strategies": {
    "preventative": ["action 1", "action 2", "action 3"],
    "detective": ["action 1", "action 2", "action 3"],
    "corrective": ["action 1", "action 2", "action 3"]
  }
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
        temperature: 0.3,
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
    console.error('Red team API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
