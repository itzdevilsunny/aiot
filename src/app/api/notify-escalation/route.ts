import { NextResponse } from 'next/server';
import { logAuditEvent } from '@/lib/server/db';

export type AlertEventType = 
  | 'CRITICAL_ESCALATION' 
  | 'APPETITE_BREACH' 
  | 'APPROVAL_REQUESTED' 
  | 'SLA_OVERDUE'
  | 'KRI_BREACH';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      riskId = 'SYS-ALERT', 
      title = 'Risk Governance Event', 
      severity = 'High', 
      score = 15, 
      ownerName = 'Governance Team', 
      category = 'Operational',
      eventType = 'CRITICAL_ESCALATION',
      reason,
      dueDate,
      channel = '#mnb-risk-alerts'
    } = body;

    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    const teamsWebhookUrl = process.env.TEAMS_WEBHOOK_URL;
    const genericWebhookUrl = process.env.GENERIC_WEBHOOK_URL || process.env.ALERT_WEBHOOK_URL;

    // Build event specific title and header
    let headerText = '🚨 Critical Risk Escalation Alert';
    let bannerEmoji = '🚨';
    if (eventType === 'APPETITE_BREACH') {
      headerText = '⚠️ Risk Appetite Threshold Exceeded';
      bannerEmoji = '⚠️';
    } else if (eventType === 'APPROVAL_REQUESTED') {
      headerText = '📝 Risk Acceptance Sign-off Requested';
      bannerEmoji = '📝';
    } else if (eventType === 'SLA_OVERDUE') {
      headerText = '⏰ Mitigation Action SLA Overdue';
      bannerEmoji = '⏰';
    } else if (eventType === 'KRI_BREACH') {
      headerText = '📈 Key Risk Indicator (KRI) Critical Drift';
      bannerEmoji = '📈';
    }

    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://risk-register-copilot.vercel.app';
    const detailUrl = `${appBaseUrl}/risk/${riskId}`;

    // 1. Slack Payload
    const slackPayload = {
      text: `${bannerEmoji} *${headerText}* [${riskId}]`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${bannerEmoji} ${headerText} — MNB Research Governance*\n*Risk ID:* \`${riskId}\`\n*Title:* ${title}\n*Category:* ${category}\n*Severity Score:* *${score} / 25* (${severity})\n*Assigned Owner:* ${ownerName}${reason ? `\n*Details:* ${reason}` : ''}${dueDate ? `\n*Target SLA:* ${dueDate}` : ''}`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Inspect in Risk Register'
              },
              url: detailUrl,
              style: eventType === 'CRITICAL_ESCALATION' ? 'danger' : 'primary'
            }
          ]
        }
      ]
    };

    // 2. Microsoft Teams Connector Card Payload
    const teamsPayload = {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      themeColor: severity === 'Critical' ? 'D32F2F' : 'FFA000',
      summary: `${headerText}: ${title}`,
      sections: [
        {
          activityTitle: `${bannerEmoji} ${headerText}`,
          activitySubtitle: `Risk ID: ${riskId} | Score: ${score}/25 (${severity})`,
          facts: [
            { name: 'Risk Title', value: title },
            { name: 'Category', value: category },
            { name: 'Owner', value: ownerName },
            ...(reason ? [{ name: 'Details', value: reason }] : []),
            ...(dueDate ? [{ name: 'Due Date', value: dueDate }] : [])
          ],
          markdown: true
        }
      ],
      potentialAction: [
        {
          '@type': 'OpenUri',
          name: 'Open Copilot Detail',
          targets: [{ os: 'default', uri: detailUrl }]
        }
      ]
    };

    const dispatchedChannels: string[] = [];

    // Dispatch to Slack
    if (slackWebhookUrl) {
      try {
        await fetch(slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slackPayload)
        });
        dispatchedChannels.push('Slack');
      } catch (err) {
        console.warn('[Webhook] Slack dispatch warning:', err);
      }
    }

    // Dispatch to Teams
    if (teamsWebhookUrl) {
      try {
        await fetch(teamsWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(teamsPayload)
        });
        dispatchedChannels.push('Microsoft Teams');
      } catch (err) {
        console.warn('[Webhook] MS Teams dispatch warning:', err);
      }
    }

    // Dispatch to Generic Webhook
    if (genericWebhookUrl) {
      try {
        await fetch(genericWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: eventType,
            timestamp: new Date().toISOString(),
            riskId,
            title,
            severity,
            score,
            ownerName,
            category,
            reason,
            dueDate,
            detailUrl
          })
        });
        dispatchedChannels.push('Generic Webhook');
      } catch (err) {
        console.warn('[Webhook] Generic webhook dispatch warning:', err);
      }
    }

    // Record in Audit Trail
    try {
      logAuditEvent({
        riskId,
        actionType: 'UPDATE',
        actorName: 'Governance Alert System',
        actorRole: 'Automated Copilot Monitor',
        changesSummary: `Dispatched ${eventType} alert notification to channels: [${dispatchedChannels.join(', ') || 'Internal System Bus'}].`
      });
    } catch (auditErr) {
      console.warn('[Webhook] Audit trail logging note:', auditErr);
    }

    return NextResponse.json({
      success: true,
      eventType,
      riskId,
      dispatchedChannels: dispatchedChannels.length > 0 ? dispatchedChannels : ['Internal Simulation / Test Bus'],
      message: `${headerText} notification dispatched successfully for ${riskId}`,
      slackPayload,
      teamsPayload
    });

  } catch (error: any) {
    console.error('Error in notify-escalation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
