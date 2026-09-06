// WhatsApp Business API Service Layer
// ─────────────────────────────────────────────────────────────
// ARCHITECTURE: All WhatsApp API calls go through this file.
// Supports two providers:
//   1. Interakt (preferred for India): Set WHATSAPP_PROVIDER=interakt
//   2. Wati: Set WHATSAPP_PROVIDER=wati
//   3. Meta Cloud API: Set WHATSAPP_PROVIDER=meta
//
// To activate, add to .env.local:
//   WHATSAPP_PROVIDER=interakt
//   WHATSAPP_API_KEY=your_api_key_here
//   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id   (meta only)
// ─────────────────────────────────────────────────────────────

const PROVIDER = process.env.WHATSAPP_PROVIDER || 'interakt';
const API_KEY = process.env.WHATSAPP_API_KEY;

// ─── Message Template Builders ────────────────────────────────
// These functions build the message text locally. No API needed.
// Use these to generate message text the user can copy-paste.

export function buildOrderConfirmationMessage(order) {
  const itemLines = order.items.map(i => `• ${i.productName} × ${i.quantity} = ₹${i.price * i.quantity}`).join('\n');
  return `🏺 *Amma Ki Rasoi*
_घर के स्वाद की परंपरा_

✅ *Order Confirmed!*
Order ID: *${order.orderId}*

📦 *Items:*
${itemLines}

💰 *Total: ₹${order.totalAmount}*
💳 Payment: ${order.paymentMethod} (${order.paymentStatus})

We'll notify you once your order is packed and shipped. 
Thank you for ordering! 🙏`;
}

export function buildShippedMessage(order) {
  return `🏺 *Amma Ki Rasoi*

🚚 *Your Order is on its way!*
Order ID: *${order.orderId}*

📦 Courier: ${order.courierName || 'Our courier partner'}
🔖 AWB: ${order.awbNumber || 'Will be shared shortly'}
${order.trackingUrl ? `🔗 Track: ${order.trackingUrl}` : ''}

Expected delivery in 3-5 business days.
Thank you for your patience! 🙏`;
}

export function buildDeliveredMessage(order) {
  return `🏺 *Amma Ki Rasoi*

✅ *Order Delivered!*
Order ID: *${order.orderId}*

We hope you love the flavours! 😊
Please share your feedback — it means the world to us.

⭐ Rate us on Google: [Your Google Review Link]
💬 WhatsApp us anytime for reorders!

With love,
_Amma Ki Rasoi_ 🏺`;
}

export function buildBroadcastMessage({ festivalName, offerText, productList }) {
  return `🎉 *${festivalName} Special — Amma Ki Rasoi!*
_घर के स्वाद की परंपरा_

${offerText}

🛍️ *Special Products:*
${productList}

📞 To order, simply reply to this message or call us!
⚡ Limited stock — order early!

_Amma Ki Rasoi_ 🏺`;
}

export function buildLowStockAlertMessage(products) {
  const lines = products
    .map(p => `• ${p.name}${p.weight ? ` (${p.weight})` : ''} — ${p.stock <= 0 ? 'OUT OF STOCK' : `only ${p.stock} left`}`)
    .join('\n');
  return `⚠️ *Low Stock Alert — Amma Ki Rasoi*

${lines}

Restock these soon to avoid missed orders.`;
}

// ─── API Send Functions ────────────────────────────────────────
// These functions actually call the WhatsApp API.
// They will throw an error if the API key is not configured.

export async function sendWhatsAppMessage(phoneNumber, message) {
  if (!API_KEY) {
    // Return the message text so the UI can show a copy-paste fallback
    return { success: false, message, reason: 'API key not configured' };
  }

  if (PROVIDER === 'interakt') {
    return sendViaInterakt(phoneNumber, message);
  } else if (PROVIDER === 'meta') {
    return sendViaMeta(phoneNumber, message);
  }

  throw new Error(`Unknown WHATSAPP_PROVIDER: ${PROVIDER}`);
}

async function sendViaInterakt(phoneNumber, message) {
  // TODO: Uncomment when API key is configured
  // const res = await fetch('https://api.interakt.ai/v1/public/message/', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Basic ${Buffer.from(API_KEY).toString('base64')}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     countryCode: '+91',
  //     phoneNumber: phoneNumber.replace(/\D/g, ''),
  //     callbackData: 'amma-ki-rasoi',
  //     type: 'Text',
  //     data: { message },
  //   }),
  // });
  // return res.json();
  return { success: false, message, reason: 'API key not configured' };
}

async function sendViaMeta(phoneNumber, message) {
  const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  // TODO: Uncomment when API key is configured
  // const res = await fetch(`https://graph.facebook.com/v18.0/${PHONE_ID}/messages`, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     messaging_product: 'whatsapp',
  //     to: phoneNumber.replace(/\D/g, ''),
  //     type: 'text',
  //     text: { body: message },
  //   }),
  // });
  // return res.json();
  return { success: false, message, reason: 'API key not configured' };
}
