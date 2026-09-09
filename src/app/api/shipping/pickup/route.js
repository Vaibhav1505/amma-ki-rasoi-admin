import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { generatePickup, isConfigured } from '@/lib/shiprocket';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

// Requests courier pickup for every shipped order that has a ShipRocket
// shipment but hasn't had a pickup requested yet.
export async function POST() {
  const authError = await requireAuth();
  if (authError) return authError;

  if (!isConfigured()) {
    return NextResponse.json({ error: 'ShipRocket is not configured.' }, { status: 400 });
  }

  try {
    await dbConnect();
    const pending = await Order.find({
      status: 'shipped',
      shiprocketShipmentId: { $exists: true, $ne: null },
      pickupScheduled: false,
    }).lean();

    if (pending.length === 0) {
      return NextResponse.json({ scheduled: 0, message: 'No shipments waiting for pickup.' }, { status: 200 });
    }

    await generatePickup(pending.map(o => o.shiprocketShipmentId));

    await Order.updateMany(
      { _id: { $in: pending.map(o => o._id) } },
      { $set: { pickupScheduled: true } }
    );

    return NextResponse.json({ scheduled: pending.length }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
