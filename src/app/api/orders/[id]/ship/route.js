import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { createShipment, isConfigured } from '@/lib/shiprocket';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function POST(request, { params }) {
  const authError = await requireAuth();
  if (authError) return authError;

  if (!isConfigured()) {
    return NextResponse.json({ error: 'ShipRocket is not configured. Add SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD to .env.local.' }, { status: 400 });
  }

  try {
    const resolvedParams = await params;
    await dbConnect();

    const existing = await Order.findById(resolvedParams.id);
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    if (['cancelled', 'return'].includes(existing.status)) {
      return NextResponse.json({ error: 'This order is finalized and cannot be shipped' }, { status: 400 });
    }
    if (existing.awbNumber) {
      return NextResponse.json({ error: 'This order already has a shipment assigned' }, { status: 400 });
    }

    const shipment = await createShipment(existing._id);

    const order = await Order.findByIdAndUpdate(
      existing._id,
      {
        status: 'shipped',
        courierName: shipment.courierName,
        awbNumber: shipment.awbNumber,
        trackingUrl: shipment.trackingUrl,
        shiprocketShipmentId: shipment.shipmentId,
        shiprocketOrderId: shipment.shiprocketOrderId,
        updatedAt: new Date(),
      },
      { new: true }
    );

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
