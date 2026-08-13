import axios from 'axios';

interface AlertNotificationPayload {
    id: string;
    camera_id: string;
    type: string;
    severity: string;
    confidence: number;
    image_url?: string;
    timestamp: string;
}

/**
 * Dispatch real-time emergency notifications to Telegram & Custom Webhooks
 */
export async function dispatchEmergencyNotification(payload: AlertNotificationPayload): Promise<void> {
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;
    const customWebhookUrl = process.env.WEBHOOK_DISPATCH_URL;

    // 1. Telegram Mobile Alert Dispatch
    if (telegramToken && telegramChatId) {
        try {
            const text = `🚨 *VISION AIoT EMERGENCY ALERT*\n\n` +
                `*Incident:* ${payload.type.replace('_', ' ')}\n` +
                `*Severity:* ${payload.severity.toUpperCase()}\n` +
                `*Camera Node:* \`${payload.camera_id}\`\n` +
                `*AI Confidence:* ${Math.round(payload.confidence * 100)}%\n` +
                `*Time:* ${new Date(payload.timestamp).toLocaleString()}\n\n` +
                `🔗 [View Live Stream Dashboard](${process.env.FRONTEND_URL || 'http://localhost:5174'})`;

            await axios.post(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
                chat_id: telegramChatId,
                text,
                parse_mode: 'Markdown',
                disable_web_page_preview: false
            });
            console.log(`[Alert Notifier] Emergency alert dispatched to Telegram Chat ${telegramChatId}`);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.warn('[Alert Notifier] Emergency dispatch error:', message);
        }
    }

    // 2. Generic Enterprise Webhook (Slack / Discord / Custom API)
    if (customWebhookUrl) {
        try {
            await axios.post(customWebhookUrl, {
                event: 'AI_ANOMALY_DETECTED',
                timestamp: payload.timestamp,
                data: payload
            });
            console.log(`[Alert Notifier] Dispatched to Webhook URL: ${customWebhookUrl}`);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.warn('[Alert Notifier] Webhook dispatch error:', message);
        }
    }
}
