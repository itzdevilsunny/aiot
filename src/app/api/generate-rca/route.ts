import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { risk } = await req.json();

    if (!risk || !risk.title) {
      return NextResponse.json({ error: 'Risk object required' }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      return NextResponse.json({
        rcaTitle: `Post-Mortem & 5-Whys Retrospective: ${risk.title}`,
        fiveWhys: [
          'Why did the risk manifest? System load exceeded pre-provisioned pool limits during batch update.',
          'Why did load exceed limits? Automated traffic scaling rules failed to trigger secondary replica.',
          'Why did scaling rules fail? Health check metric ping timed out during high network congestion.',
          'Why did health check time out? Single point of telemetry monitoring node experienced CPU throttle.',
          'Root Cause: Absence of multi-region redundant health check polling agents.'
        ],
        lessonsLearned: [
          'Telemetry monitoring must operate independently from primary application subnets.',
          'Automated canary releases must require mandatory load testing before production promotion.'
        ],
        preventativeActions: [
          'Deploy multi-region synthetic monitoring agents.',
          'Enforce SLA alerts at 70% threshold instead of 90%.'
        ],
        executiveSummary: `Post-incident analysis for ${risk.id} confirmed root cause tied to telemetry single point of failure. Remediation action items deployed.`,
        source: 'fallback'
      });
    }

    const prompt = `You are a Principal Reliability Engineer and Incident Commander. Generate a formal 5-Whys Root Cause Analysis (RCA) post-mortem report for this risk item:
Title: "${risk.title}"
Category: "${risk.category}"
Description: "${risk.description}"
Status: "${risk.status}"

Formulate a structured 5-Whys analysis, key lessons learned, preventative action items, and executive summary memo.

Respond ONLY with a valid JSON object matching this exact structure:
{
  "rcaTitle": "Post-Mortem & 5-Whys Retrospective: Title",
  "fiveWhys": ["Why 1", "Why 2", "Why 3", "Why 4", "Root Cause"],
  "lessonsLearned": ["Lesson 1", "Lesson 2"],
  "preventativeActions": ["Action 1", "Action 2"],
  "executiveSummary": "Executive summary paragraph"
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
    console.error('RCA API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
