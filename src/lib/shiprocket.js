import dbConnect from '../../lib/mongodb';
import Order from '../../lib/models/Order';

// ShipRocket service layer
// ─────────────────────────────────────────────────────────────
// ARCHITECTURE: All ShipRocket API calls go through this file.
// To activate real integration, set SHIPROCKET_EMAIL and
// SHIPROCKET_PASSWORD in your .env.local file.
// The functions below handle auth + token refresh automatically.
// ─────────────────────────────────────────────────────────────

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';
const EMAIL = process.env.SHIPROCKET_EMAIL;
const PASSWORD = process.env.SHIPROCKET_PASSWORD;

let cachedToken = null;
let tokenExpiry = null;

async function getToken() {
  // Return cached token if still valid
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  // TODO: Uncomment when API keys are configured
  // const res = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  // });
  // const data = await res.json();
  // cachedToken = data.token;
  // tokenExpiry = Date.now() + (9 * 24 * 60 * 60 * 1000); // tokens expire in 10 days
  // return cachedToken;

  return null; // Placeholder until keys are set
}

export async function createShipment(orderId) {
  const token = await getToken();
  if (!token) {
    throw new Error('ShipRocket not configured. Please set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in .env.local');
  }

  await dbConnect();
  const order = await Order.findById(orderId).lean();
  if (!order) throw new Error('Order not found');

  // TODO: Uncomment when API keys are configured
  // const res = await fetch(`${SHIPROCKET_BASE_URL}/orders/create/adhoc`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  //   body: JSON.stringify(mapOrderToShipRocket(order)),
  // });
  // const data = await res.json();
  // return data;

  // Placeholder response
  return { message: 'ShipRocket API key not configured', orderId };
}

export async function trackShipment(awbNumber) {
  const token = await getToken();
  if (!token) throw new Error('ShipRocket not configured.');

  // TODO: Uncomment when API keys are configured
  // const res = await fetch(`${SHIPROCKET_BASE_URL}/courier/track/awb/${awbNumber}`, {
  //   headers: { 'Authorization': `Bearer ${token}` },
  // });
  // return res.json();

  return { message: 'ShipRocket API key not configured', awbNumber };
}

export async function getWalletBalance() {
  const token = await getToken();
  if (!token) return null;

  // TODO: Uncomment when API keys are configured
  // const res = await fetch(`${SHIPROCKET_BASE_URL}/account/details/wallet-balance`, {
  //   headers: { 'Authorization': `Bearer ${token}` },
  // });
  // const data = await res.json();
  // return data.data?.balance;

  return null;
}

// Maps our order format to ShipRocket's expected format
function mapOrderToShipRocket(order) {
  return {
    order_id: order.orderId,
    order_date: new Date(order.createdAt).toISOString().split('T')[0],
    pickup_location: 'Primary',
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
