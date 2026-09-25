import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { rawRows } = await req.json();

    if (!rawRows || !Array.isArray(rawRows) || rawRows.length === 0) {
      return NextResponse.json({ error: 'No CSV rows provided' }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      // Intelligent mock fallback if API key missing
      const mapped = rawRows.slice(0, 10).map((row: any, idx: number) => {
        const title = row.title || row.risk || row.name || `Imported Threat ${idx + 1}`;
        const description = row.description || row.desc || row.details || `Bulk imported risk record: ${title}`;
        const prob = Math.min(5, Math.max(1, Number(row.probability || row.prob || 3)));
        const imp = Math.min(5, Math.max(1, Number(row.impact || row.imp || 3)));
        const score = prob * imp;

        return {
          title,
          description,
          category: row.category || 'Operational',
          probability: prob,
          impact: imp,
          score,
          severity: score >= 20 ? 'Critical' : score >= 12 ? 'High' : score >= 6 ? 'Medium' : 'Low',
          ownerName: row.owner || 'Assigned Lead',
          ownerRole: 'Risk Owner',
          mitigationPlan: row.mitigation || 'Establish proactive monitoring and regular status review.',
          contingencyPlan: row.contingency || 'Activate backup operational protocol upon trigger threshold.',
          estimatedImpactUsd: Math.round(score * 2500)
        };
      });

      return NextResponse.json({ risks: mapped, source: 'fallback' });
    }

    const prompt = `You are an Enterprise Risk Management Auditor. Analyze the following raw CSV rows representing project/enterprise risks:
${JSON.stringify(rawRows.slice(0, 15), null, 2)}

For each row, sanitize, standardize, and extract structured risk fields into a JSON array.
Respond ONLY with a JSON object containing a "risks" array with items matching this exact format:
{
  "risks": [
    {
      "title": "Short descriptive title",
      "description": "Comprehensive explanation of threat",
      "category": "Technical" | "Resource" | "Financial" | "Schedule" | "Operational" | "Security" | "Compliance" | "External",
      "probability": 1-5 integer,
      "impact": 1-5 integer,
      "score": probability * impact,
      "severity": "Critical" | "High" | "Medium" | "Low",
      "ownerName": "Full Name",
      "ownerRole": "Title / Department",
      "mitigationPlan": "Actionable preventative strategy",
      "contingencyPlan": "Fallback emergency plan",
      "estimatedImpactUsd": integer estimated dollar loss
    }
  ]
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
      throw new Error(`Groq API responded with status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return NextResponse.json({
      risks: parsed.risks || [],
      source: 'groq-llama-3.3-70b'
    });
  } catch (error: any) {
    console.error('CSV import API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
