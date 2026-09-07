import dbConnect from '../../../lib/mongodb';
import Order from '../../../lib/models/Order';
import Counter from '../../../lib/models/Counter';
import { applyOrderStockChange } from '../../../lib/inventory';
import { ensureCustomer } from '../../../lib/customers';
import { NextResponse } from 'next/server';
import { requireAuth } from '../../../lib/auth';

export async function POST(request) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    await dbConnect();
    const body = await request.json();

    // Auto-generate order ID from an atomic counter (safe under concurrent requests)
    const counter = await Counter.findByIdAndUpdate(
      'orderId',
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const orderId = `#AKR-${String(counter.seq).padStart(4, '0')}`;

    const order = await Order.create({ ...body, orderId });

    await applyOrderStockChange(order, { direction: -1, reason: 'order_placed' });
    await ensureCustomer(order.customerPhone);

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
