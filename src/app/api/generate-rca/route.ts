import { NextRequest, NextResponse } from 'next/server';
import { callGroqAI } from '@/lib/groq';
import { callGeminiAI } from '@/lib/gemini';
import { getRisks } from '@/lib/server/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let risk = body.risk;

    if (!risk && body.riskId) {
      const allRisks = getRisks();
      risk = allRisks.find((r: any) => r.id === body.riskId);
    }

    if (!risk || !risk.title) {
      const allRisks = getRisks();
      risk = allRisks[0] || {
        id: 'RSK-201',
        title: 'Payment Gateway Key Exhaustion',
        category: 'Technical',
        description: 'Primary cryptographic key rotation exhaustion under peak load.',
        status: 'Open',
        ownerName: 'Sunny Prasad'
      };
    }

    const prompt = `You are a Principal Reliability Engineer and Incident Commander for MNB Research. Generate a formal 5-Whys Root Cause Analysis (RCA) post-mortem report for this risk item:
Title: "${risk.title}"
Category: "${risk.category}"
Description: "${risk.description || risk.title}"
Status: "${risk.status}"
Owner: "${risk.ownerName || 'Sunny Prasad'}"

Formulate a structured 5-Whys analysis, key lessons learned, preventative action items, and executive summary memo.

Respond ONLY with a valid JSON object matching this exact structure:
{
  "rcaTitle": "Post-Mortem & 5-Whys Retrospective: ${risk.title}",
  "fiveWhys": ["Why 1...", "Why 2...", "Why 3...", "Why 4...", "Root Cause: ..."],
  "lessonsLearned": ["Lesson 1...", "Lesson 2..."],
  "preventativeActions": ["Action 1...", "Action 2..."],
  "executiveSummary": "Executive summary paragraph"
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
        console.warn('Groq RCA parse note:', e);
      }
    }

    // 2. Secondary: Google Gemini 3.8 Flash
    const geminiResult = await callGeminiAI({
      prompt,
      jsonMode: true,
      temperature: 0.2
    });

    if (geminiResult.success && geminiResult.content) {
      try {
        const parsed = JSON.parse(geminiResult.content);
        if (parsed && parsed.rcaTitle) {
          return NextResponse.json({
            ...parsed,
            source: `Google Gemini (${geminiResult.model})`
          });
        }
      } catch (e) {
        console.warn('Gemini RCA parse note:', e);
      }
    }

    // If neither provider succeeded, return an honest error
    return NextResponse.json(
      {
        error: 'AI 5-Whys root cause analysis service temporarily unavailable.',
        details: 'Neither Groq nor Google Gemini could generate a retrospective analysis for this risk.',
        groqStatus: groqResult.error || (groqResult.success ? 'Invalid structured output' : 'Provider call failed'),
        geminiStatus: geminiResult.error || (geminiResult.success ? 'Invalid structured output' : 'Provider call failed')
      },
      { status: 503 }
    );
  } catch (error: any) {
    console.error('RCA API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
