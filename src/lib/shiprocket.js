import dbConnect from './mongodb';
import Order from './models/Order';

// ShipRocket service layer
// ─────────────────────────────────────────────────────────────
// ARCHITECTURE: All ShipRocket API calls go through this file.
// To activate real integration, set SHIPROCKET_EMAIL and
// SHIPROCKET_PASSWORD in your .env.local file.
//
// IMPORTANT: this is written against ShipRocket's publicly documented
// v1 external API (auth/login, orders/create/adhoc, courier/assign/awb,
// courier/generate/pickup, courier/track/awb) — the standard endpoints
// and payload shapes as documented. It has NOT been exercised against a
// live ShipRocket account (no credentials were available while building
// this), so treat the first real run as an integration test: if a field
// name in their response differs from what's read below, you'll see it
// fail loudly with the raw response logged rather than silently
// corrupting order data — check server logs and adjust the `data.*`
// field paths accordingly.
// ─────────────────────────────────────────────────────────────

// Maps ShipRocket's free-text courier status to our internal status enum.
// Anything not listed here is left as informational-only (tracking info
// updates without changing our order status).
export const STATUS_MAP = {
  'shipped': 'shipped',
  'picked up': 'shipped',
  'in transit': 'shipped',
  'out for delivery': 'shipped',
  'delivered': 'delivered',
  'cancelled': 'cancelled',
  'cancellation requested': 'cancelled',
  'rto initiated': 'return',
  'rto delivered': 'return',
  'rto acknowledged': 'return',
};

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';
const EMAIL = process.env.SHIPROCKET_EMAIL;
const PASSWORD = process.env.SHIPROCKET_PASSWORD;
const PICKUP_LOCATION = process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary';

let cachedToken = null;
let tokenExpiry = null;

export function isConfigured() {
  return Boolean(EMAIL && PASSWORD);
}

async function getToken() {
  if (!isConfigured()) return null;

  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const res = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`ShipRocket auth failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  cachedToken = data.token;
  tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000; // tokens are valid ~10 days
  return cachedToken;
}

async function srFetch(path, options = {}) {
  const token = await getToken();
  const res = await fetch(`${SHIPROCKET_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`ShipRocket ${path} failed (${res.status}): ${JSON.stringify(data)}`);
  }
  return data;
}

// Creates the shipment order on ShipRocket, then assigns a courier/AWB to
// it, and returns the details needed to update our own Order record.
export async function createShipment(orderId) {
  if (!isConfigured()) {
    throw new Error('ShipRocket not configured. Set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in .env.local');
  }

  await dbConnect();
  const order = await Order.findById(orderId).lean();
  if (!order) throw new Error('Order not found');

  const createRes = await srFetch('/orders/create/adhoc', {
    method: 'POST',
    body: JSON.stringify(mapOrderToShipRocket(order)),
  });

  const shipmentId = createRes.shipment_id;
  const shiprocketOrderId = createRes.order_id;
  if (!shipmentId) {
    throw new Error(`ShipRocket did not return a shipment_id: ${JSON.stringify(createRes)}`);
  }

  // Let ShipRocket auto-select the courier for this shipment
  const awbRes = await srFetch('/courier/assign/awb', {
    method: 'POST',
    body: JSON.stringify({ shipment_id: shipmentId }),
  });

  const awbData = awbRes.response?.data || {};

  return {
    shipmentId: String(shipmentId),
    shiprocketOrderId: shiprocketOrderId ? String(shiprocketOrderId) : undefined,
    courierName: awbData.courier_name,
    awbNumber: awbData.awb_code,
    trackingUrl: awbData.awb_code ? `https://shiprocket.co/tracking/${awbData.awb_code}` : undefined,
  };
}

// Requests courier pickup for one or more already-AWB-assigned shipments.
export async function generatePickup(shipmentIds) {
  if (!isConfigured()) {
    throw new Error('ShipRocket not configured.');
  }
  return srFetch('/courier/generate/pickup', {
    method: 'POST',
    body: JSON.stringify({ shipment_id: shipmentIds }),
  });
}

export async function trackShipment(awbNumber) {
  if (!isConfigured()) {
    throw new Error('ShipRocket not configured.');
  }
  return srFetch(`/courier/track/awb/${awbNumber}`, { method: 'GET' });
}

export async function getWalletBalance() {
  if (!isConfigured()) return null;
  const data = await srFetch('/account/details/wallet-balance', { method: 'GET' });
  return data.data?.balance ?? null;
}

// Maps our order format to ShipRocket's expected format
function mapOrderToShipRocket(order) {
  return {
    order_id: order.orderId,
    order_date: new Date(order.createdAt).toISOString().split('T')[0],
    pickup_location: PICKUP_LOCATION,
    billing_customer_name: order.customerName,
    billing_phone: order.customerPhone,
    billing_address: order.shippingAddress,
    billing_city: 'Lucknow',   // TODO: parse from address
    billing_state: 'Uttar Pradesh',
    billing_country: 'India',
    billing_pincode: '226001', // TODO: parse from address
    shipping_is_billing: true,
    order_items: order.items.map(item => ({
      name: item.productName,
      sku: item.productName.replace(/\s+/g, '-').toLowerCase(),
      units: item.quantity,
      selling_price: item.price,
    })),
    payment_method: order.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
    sub_total: order.totalAmount,
    weight: 0.5 * order.items.reduce((sum, i) => sum + i.quantity, 0),
  };
}
