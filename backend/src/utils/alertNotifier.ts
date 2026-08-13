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
            const caption = `🚨 *VISION AIoT DEFENSE ALERT*\n\n` +
                `*Incident:* ${payload.type.replace(/_/g, ' ')}\n` +
                `*Severity:* ${payload.severity.toUpperCase()}\n` +
                `*Camera Node:* \`${payload.camera_id}\`\n` +
                `*AI Confidence:* ${Math.round(payload.confidence * 100)}%\n` +
                `*Timestamp:* ${new Date(payload.timestamp).toLocaleString()}\n\n` +
                `🔗 [Open Live Dashboard](${process.env.FRONTEND_URL || 'https://defence-surveillance-system-snowy.vercel.app'})`;

            if (payload.image_url && payload.image_url.startsWith('http')) {
                await axios.post(`https://api.telegram.org/bot${telegramToken}/sendPhoto`, {
                    chat_id: telegramChatId,
                    photo: payload.image_url,
                    caption,
                    parse_mode: 'Markdown'
                });
            } else {
                await axios.post(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
                    chat_id: telegramChatId,
                    text: caption,
                    parse_mode: 'Markdown',
                    disable_web_page_preview: false
                });
            }
            console.log(`[Alert Notifier] Emergency alert photo dispatched to Telegram Chat ${telegramChatId}`);
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
