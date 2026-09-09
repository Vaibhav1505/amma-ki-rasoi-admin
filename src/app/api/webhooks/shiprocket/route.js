import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { syncOrderStatus } from '@/lib/orderTrackingSync';
import { NextResponse } from 'next/server';

// Receives ShipRocket's shipment-status webhook and syncs it onto the
// matching order. Configure this URL (with ?token=SHIPROCKET_WEBHOOK_SECRET)
// in ShipRocket's dashboard under Settings > API > Webhooks.
//
// NOTE: this is written against ShipRocket's commonly documented webhook
// payload (order_id / awb / current_status fields), but has not been
// verified against a live webhook delivery — if their exact field names
// differ, this will safely acknowledge without applying anything (see the
// "matched: false" / "applied: false" responses below) rather than throw,
// so check server logs / the response body after the first real delivery
// and adjust the field paths if needed.
export async function POST(request) {
  const secret = process.env.SHIPROCKET_WEBHOOK_SECRET;
  if (secret) {
    const token = new URL(request.url).searchParams.get('token');
    if (token !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const shiprocketOrderId = payload.order_id ? String(payload.order_id) : null;
  const awb = payload.awb || payload.awb_code || null;
  const currentStatus = payload.current_status || payload.status || '';

  if (!shiprocketOrderId && !awb) {
    // Can't match this to an order — acknowledge so ShipRocket doesn't retry indefinitely
    return NextResponse.json({ received: true, matched: false }, { status: 200 });
  }

  await dbConnect();
  const order = await Order.findOne(
    shiprocketOrderId ? { shiprocketOrderId } : { awbNumber: awb }
  );

  if (!order) {
    return NextResponse.json({ received: true, matched: false }, { status: 200 });
  }

  const { applied } = await syncOrderStatus(order, currentStatus);

  return NextResponse.json({ received: true, matched: true, applied }, { status: 200 });
}
