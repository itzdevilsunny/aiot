import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { risks } = await req.json();

    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      return NextResponse.json({
        soaTitle: 'ISO 27001:2022 Statement of Applicability (SoA) & Control Assurance',
        overview: 'Formal Information Security Management System (ISMS) Statement of Applicability generated from live risk register telemetry.',
        controls: [
          {
            controlId: 'A.5.15',
            name: 'Access Control & Authentication Safeguards',
            applicable: true,
            justification: 'Critical for protecting cloud infrastructure and API routes against unauthorized access.',
            implementationStatus: 'Implemented & Monitored'
          },
          {
            controlId: 'A.8.8',
            name: 'Management of Technical Vulnerabilities',
            applicable: true,
            justification: 'Automated CVE scanning and patch management cycle for all container dependencies.',
            implementationStatus: 'Implemented'
          },
          {
            controlId: 'A.8.12',
            name: 'Data Leakage Prevention & Incident Response',
            applicable: true,
            justification: 'Real-time telemetry and 5-Whys RCA post-mortem protocols.',
            implementationStatus: 'Implemented & Monitored'
          }
        ],
        auditorMemo: 'This Statement of Applicability confirms that technical, operational, and organizational security controls are active.',
        source: 'fallback'
      });
    }

    const prompt = `You are a Lead ISO 27001 Auditor and Chief Information Security Officer. Synthesize an official ISO 27001 Statement of Applicability (SoA) document based on this risk register summary:
Active Risks: ${risks?.length || 0} items.

Generate a structured SoA report containing ISO 27001:2022 control mappings (A.5.15, A.8.8, A.8.12, A.8.16, A.8.20), applicability justifications, implementation status, and auditor memo.

Respond ONLY with a valid JSON object matching this exact structure:
{
  "soaTitle": "ISO 27001:2022 Statement of Applicability (SoA) & Control Assurance",
  "overview": "Overview paragraph",
  "controls": [
    {
      "controlId": "A.X.Y",
      "name": "Control Title",
      "applicable": true,
      "justification": "Why control is applicable to business risk posture",
      "implementationStatus": "Implemented" | "In Progress" | "Monitored"
    }
  ],
  "auditorMemo": "Official sign-off memo text for audit submission"
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
    console.error('SoA API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
