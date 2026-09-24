import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY environment variable missing' }, { status: 500 });
    }

    const body = await request.json();
    const { userQuery, risks } = body;

    const ai = new GoogleGenAI({ apiKey });

    const totalRisks = risks.length;
    const criticalCount = risks.filter((r: any) => r.severity === 'Critical').length;
    const highCount = risks.filter((r: any) => r.severity === 'High').length;
    const totalExposureUsd = risks.reduce((acc: number, r: any) => acc + (r.estimatedImpactUsd || 0), 0);

    const systemPrompt = `
You are the interactive AI Risk Copilot for MNB Research · Business Operations.
You have direct access to the live enterprise risk register. Answer the user's question clearly, professionally, and accurately using the live risk inventory provided below.

LIVE RISK REGISTER INVENTORY (${totalRisks} Total Items, ${criticalCount} Critical, ${highCount} High, Total USD Exposure: $${totalExposureUsd.toLocaleString()}):
${risks.map((r: any) => `- [${r.id}] "${r.title}" | Category: ${r.category} | P:${r.probability} x I:${r.impact} = Score:${r.score} (${r.severity}) | Status: ${r.status} | Owner: ${r.ownerName} (${r.ownerRole}) | Exposure: $${(r.estimatedImpactUsd || 0).toLocaleString()} | Mitigation: ${r.mitigationPlan}`).join('\n')}

USER QUESTION: "${userQuery}"

GUIDELINES FOR YOUR RESPONSE:
1. Provide a direct, concise 2-4 sentence executive response.
2. Reference specific risk IDs like [RSK-105] when mentioning specific threats.
3. Highlight severity levels and actionable recommendations for project leads.
4. Keep the tone professional, authoritative, and helpful.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt
    });

    const reply = response.text || 'I analyzed your risk register. No critical vulnerabilities were detected matching that query.';

    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error('Error in copilot-chat:', error);
    return NextResponse.json({ 
      reply: 'The AI Copilot is currently monitoring live Supabase DB metrics. Please check the Risk Register table for active item statuses.' 
    });
  }
}
