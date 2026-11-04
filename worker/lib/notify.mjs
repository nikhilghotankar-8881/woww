// worker/lib/notify.mjs
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * Formats a farmer-friendly WhatsApp message in Marathi, Hindi, or English
 */
export function formatWhatsAppMessage({ schemeName = 'PM-KISAN', summary = '', reasons = [], officialUrl = 'https://pmkisan.gov.in/', lang = 'mr' }) {
  if (lang === 'mr') {
    const reasonText = reasons.length > 0 ? `\n\n📌 *तुमच्या शेतीसाठी महत्त्व:*\n• ${reasons.join('\n• ')}` : '';
    return `📢 *शेतकरी सूचना सेतू | अधिकृत शासकीय सूचना बदल*

🌾 *योजना:* ${schemeName}
⚡ *नवीन बदल:* ${summary}${reasonText}

🔗 *अधिकृत संकेतस्थळ:* ${officialUrl}
📱 *तपशील ॲपमध्ये पहा:* https://shetkari.vercel.app/alerts

_सूचना: ही माहिती अधिकृत पोर्टलवरून गोळा करून मानवी पडताळणीनंतर पाठवली आहे._`;
  }

  if (lang === 'hi') {
    const reasonText = reasons.length > 0 ? `\n\n📌 *आपकी खेती के लिए महत्व:*\n• ${reasons.join('\n• ')}` : '';
    return `📢 *किसान सूचना सेतु | आधिकारिक सरकारी सूचना परिवर्तन*

🌾 *योजना:* ${schemeName}
⚡ *नया बदलाव:* ${summary}${reasonText}

🔗 *आधिकारिक पोर्टल:* ${officialUrl}
📱 *विवरण ऐप में देखें:* https://shetkari.vercel.app/alerts

_सूचना: यह जानकारी आधिकारिक पोर्टल से सत्यापित करने के बाद भेजी गई है।_`;
  }

  // English fallback
  const reasonText = reasons.length > 0 ? `\n\n📌 *Why this matters to you:*\n• ${reasons.join('\n• ')}` : '';
  return `📢 *Shetkari Suchna Setu | Official Notice Alert*

🌾 *Scheme:* ${schemeName}
⚡ *Verified Update:* ${summary}${reasonText}

🔗 *Official Portal:* ${officialUrl}
📱 *View in App:* https://shetkari.vercel.app/alerts

_Note: Sourced from official portal and verified by human reviewer._`;
}

/**
 * Formats a concise SMS text (< 160 chars)
 */
export function formatSmsMessage({ schemeName = 'PM-KISAN', summary = '', officialUrl = 'https://pmkisan.gov.in/', lang = 'mr' }) {
  if (lang === 'mr') {
    const cleanSummary = summary.slice(0, 85);
    return `[शेतकरी सूचनासेतू] ${schemeName}: ${cleanSummary}. खात्री करा: ${officialUrl}`;
  }
  if (lang === 'hi') {
    const cleanSummary = summary.slice(0, 85);
    return `[सूचनासेतु] ${schemeName}: ${cleanSummary}. पोर्टल: ${officialUrl}`;
  }
  const cleanSummary = summary.slice(0, 90);
  return `[SuchnaSetu] ${schemeName}: ${cleanSummary}. Verify: ${officialUrl}`;
}

/**
 * Sends WhatsApp message via Meta WhatsApp Business Cloud API
 * If API credentials are not configured, runs in high-fidelity simulated mode.
 */
export async function sendWhatsAppMessage({ to, message, templateName = null }) {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  // Clean phone number to E.164 without '+' or leading zeros
  const cleanPhone = to ? to.replace(/\D/g, '') : '';

  if (!token || !phoneId) {
    console.log(`[WhatsApp:SIMULATED] -> To: ${cleanPhone || to} | Body: "${message.slice(0, 60)}..."`);
    return {
      status: 'simulated',
      provider: 'whatsapp_mock',
      providerMsgId: 'mock-wa-' + Date.now(),
      error: null
    };
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      to: cleanPhone,
      type: 'text',
      text: {
        preview_url: true,
        body: message
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok && data.messages?.[0]?.id) {
      return {
        status: 'sent',
        provider: 'whatsapp_cloud_api',
        providerMsgId: data.messages[0].id,
        error: null
      };
    }

    return {
      status: 'failed',
      provider: 'whatsapp_cloud_api',
      providerMsgId: null,
      error: data.error?.message || 'WhatsApp Cloud API error'
    };
  } catch (err) {
    console.warn('[WhatsApp Error]:', err.message);
    return {
      status: 'failed',
      provider: 'whatsapp_cloud_api',
      providerMsgId: null,
      error: err.message
    };
  }
}

/**
 * Sends SMS message via Twilio REST API
 * If credentials are not configured, runs in simulated mode.
 */
export async function sendSmsMessage({ to, message }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.log(`[SMS:SIMULATED] -> To: ${to} | Body: "${message.slice(0, 60)}..."`);
    return {
      status: 'simulated',
      provider: 'twilio_mock',
      providerMsgId: 'mock-sms-' + Date.now(),
      error: null
    };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const params = new URLSearchParams({
      To: to,
      From: fromNumber,
      Body: message
    });

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await res.json();
    if (res.ok && data.sid) {
      return {
        status: 'sent',
        provider: 'twilio',
        providerMsgId: data.sid,
        error: null
      };
    }

    return {
      status: 'failed',
      provider: 'twilio',
      providerMsgId: null,
      error: data.message || 'Twilio SMS API error'
    };
  } catch (err) {
    console.warn('[SMS Error]:', err.message);
    return {
      status: 'failed',
      provider: 'twilio',
      providerMsgId: null,
      error: err.message
    };
  }
}

/**
 * Dispatches outbound notifications (WhatsApp and/or SMS) for fanned-out alerts.
 */
export async function dispatchOutboundAlerts(alertsWithProfiles = [], change = {}, supabaseClient = null) {
  if (!alertsWithProfiles || alertsWithProfiles.length === 0) return 0;

  const logsToInsert = [];
  let successfulDispatches = 0;

  for (const item of alertsWithProfiles) {
    const { profile, alertId, schemeId } = item;
    if (!profile || !profile.phone) continue;

    const lang = profile.lang || 'mr';
    const officialUrl = change.source_id === 'pmkisan-home'
      ? 'https://pmkisan.gov.in/'
      : (change.source_id === 'pmfby-portal' ? 'https://pmfby.gov.in/' : 'https://mahadbt.maharashtra.gov.in/');

    // 1. WhatsApp Dispatch (if enabled or default)
    if (profile.notify_whatsapp !== false) {
      const waMessage = formatWhatsAppMessage({
        schemeName: schemeId.toUpperCase(),
        summary: change.summary || 'Official notification update published',
        reasons: item.reasons || [],
        officialUrl,
        lang
      });

      const waResult = await sendWhatsAppMessage({
        to: profile.phone,
        message: waMessage
      });

      logsToInsert.push({
        user_id: profile.id,
        alert_id: alertId || null,
        change_id: change.id,
        channel: 'whatsapp',
        recipient: profile.phone,
        message_body: waMessage,
        status: waResult.status,
        provider: waResult.provider,
        provider_msg_id: waResult.providerMsgId,
        error_message: waResult.error
      });

      if (waResult.status === 'sent' || waResult.status === 'simulated') {
        successfulDispatches++;
      }
    }

    // 2. SMS Dispatch (if enabled)
    if (profile.notify_sms === true) {
      const smsMessage = formatSmsMessage({
        schemeName: schemeId.toUpperCase(),
        summary: change.summary || 'Notice updated',
        officialUrl,
        lang
      });

      const smsResult = await sendSmsMessage({
        to: profile.phone,
        message: smsMessage
      });

      logsToInsert.push({
        user_id: profile.id,
        alert_id: alertId || null,
        change_id: change.id,
        channel: 'sms',
        recipient: profile.phone,
        message_body: smsMessage,
        status: smsResult.status,
        provider: smsResult.provider,
        provider_msg_id: smsResult.providerMsgId,
        error_message: smsResult.error
      });

      if (smsResult.status === 'sent' || smsResult.status === 'simulated') {
        successfulDispatches++;
      }
    }
  }

  // Insert logs into notification_logs table if supabaseClient is available
  if (supabaseClient && logsToInsert.length > 0) {
    try {
      await supabaseClient.from('notification_logs').insert(logsToInsert);
    } catch (err) {
      console.warn('[NotificationLogs] Failed to write logs to DB:', err.message);
    }
  }

  return successfulDispatches;
}

