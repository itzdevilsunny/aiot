import twilio from 'twilio';
import { AuditLogModel } from '../models';

// Initialize Twilio client (requires TWILIO_SID and TWILIO_AUTH_TOKEN in .env)
const client = twilio(
  process.env.TWILIO_SID || 'AC_dummy_sid_for_demo',
  process.env.TWILIO_AUTH_TOKEN || 'dummy_token_for_demo'
);

export const dispatchViolenceAlert = async (alertData: { camId: string, details: string }) => {
  const message = `🚨 CRITICAL: INDIAN RED FLAG @ ${alertData.camId}
Details: ${alertData.details || 'Violent activity detected'}
Location: Sector 9 - Perimeter
Action: Immediate Dispatch Required.`;

  try {
    // 1. Send SMS to Team Leader (Sunny Prasad)
    // Avoid actually sending SMS in dev unless explicitly configured
    if (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN) {
        await client.messages.create({
            body: message,
            to: process.env.EMERGENCY_PHONE_NUMBER || '+910000000000', // Verified number
            from: process.env.TWILIO_PHONE_NUMBER || '+10000000000'
        });
        console.log("✅ Dispatch notifications sent via Twilio to HackOps Crew.");
    } else {
        console.log("⚠️ SMS Simulation (No Twilio config):", message.replace(/\n/g, ' '));
        console.log("✅ Simulation: Dispatch notifications sent to HackOps Crew.");
    }

    // 2. Log to Audit Trail
    const log = new AuditLogModel({
      action: `DISPATCH_SENT: Violence Alert sent for ${alertData.camId}`,
      actor_email: 'SYSTEM',
      ip_address: '127.0.0.1' // Internal system action
    });
    
    // Failing silently here if DB is not connected so the rest of the flow continues
    await log.save().catch(() => {});
    
  } catch (error) {
    console.error("❌ Notification failed:", error);
  }
};
