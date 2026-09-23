import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { riskId, title, severity, score, ownerName, category } = body;

    const webhookUrl = process.env.SLACK_WEBHOOK_URL;

    const slackPayload = {
      text: `🚨 *CRITICAL RISK ESCALATION DETECTED* [${riskId}]`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*🚨 Critical Risk Escalation Alert — MNB Research Operations*\n*Risk ID:* \`${riskId}\`\n*Title:* ${title}\n*Category:* ${category}\n*Severity Score:* *${score} / 25* (${severity})\n*Assigned Owner:* ${ownerName}`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Risk Detail'
              },
              url: `http://localhost:3000/risk/${riskId}`,
              style: 'danger'
            }
          ]
        }
      ]
    };

    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackPayload)
      });
    }

    return NextResponse.json({
      success: true,
      message: `Escalation notification dispatched for ${riskId}`,
      payloadSent: slackPayload
    });

  } catch (error: any) {
    console.error('Error in notify-escalation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
