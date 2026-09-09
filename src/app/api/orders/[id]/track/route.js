import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { trackShipment } from '@/lib/shiprocket';
import { syncOrderStatus } from '@/lib/orderTrackingSync';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

// Manually pulls the latest status from ShipRocket for one order — a
// polling fallback for while the webhook isn't configured (or to force
// a refresh right now instead of waiting for the next push).
export async function POST(request, { params }) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const resolvedParams = await params;
    await dbConnect();

    const order = await Order.findById(resolvedParams.id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    if (!order.awbNumber) {
      return NextResponse.json({ error: 'This order has no AWB/courier assigned yet' }, { status: 400 });
    }

    const trackData = await trackShipment(order.awbNumber);
    // Documented ShipRocket shape: { tracking_data: { shipment_track: [{ current_status }] } }
    const currentStatus =
      trackData?.tracking_data?.shipment_track?.[0]?.current_status ||
      trackData?.tracking_data?.track_status ||
      '';

    const { order: updated, applied } = await syncOrderStatus(order, currentStatus);

    return NextResponse.json({ order: updated, applied, rawStatus: currentStatus }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
