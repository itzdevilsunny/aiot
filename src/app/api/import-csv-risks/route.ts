import { NextRequest, NextResponse } from 'next/server';
import { callGroqAI } from '@/lib/groq';

export async function POST(req: NextRequest) {
  try {
    const { rawRows } = await req.json();

    if (!rawRows || !Array.isArray(rawRows) || rawRows.length === 0) {
      return NextResponse.json({ error: 'No CSV rows provided' }, { status: 400 });
    }

    const prompt = `You are an Enterprise Risk Management Auditor for MNB Research. Analyze the following raw CSV rows representing project/enterprise risks:
${JSON.stringify(rawRows.slice(0, 15), null, 2)}

Team Context for Suggested Owners:
- Sunny Prasad (Business Operations Intern & Risk Lead - Technical, Operational)
- Yash Raj (Operations Lead - Financial, External)
- Ritika (Product Manager - Schedule, Product)
- Sumit (Resource Manager - Resource)
- Priya Sharma (Compliance Lead - Compliance, Security)

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

    // 1. Primary: Groq Qwen (qwen/qwen3.8-27b)
    const groqResult = await callGroqAI({
      messages: [{ role: 'user', content: prompt }],
      jsonMode: true,
      temperature: 0.2
    });

    if (groqResult.success && groqResult.content) {
      try {
        const parsed = JSON.parse(groqResult.content);
        if (parsed && Array.isArray(parsed.risks) && parsed.risks.length > 0) {
          return NextResponse.json({
            risks: parsed.risks,
            source: `Groq (${groqResult.model})`
          });
        }
      } catch (err) {
        console.warn('Groq CSV parse note:', err);
      }
    }

    // 2. Dynamic Fallback
    const mapped = rawRows.slice(0, 15).map((row: any, idx: number) => {
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
        severity: score >= 17 ? 'Critical' : score >= 10 ? 'High' : score >= 5 ? 'Medium' : 'Low',
        ownerName: row.owner || 'Sunny Prasad',
        ownerRole: 'Business Operations Intern & Risk Lead',
        mitigationPlan: row.mitigation || 'Establish proactive monitoring and regular status review.',
        contingencyPlan: row.contingency || 'Activate backup operational protocol upon trigger threshold.',
        estimatedImpactUsd: Math.round(score * 2500)
      };
    });

    return NextResponse.json({ risks: mapped, source: 'Dynamic Context Engine' });
  } catch (error: any) {
    console.error('Import CSV error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
