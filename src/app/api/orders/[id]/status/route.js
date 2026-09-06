import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { applyOrderStockChange } from '@/lib/inventory';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function PATCH(request, { params }) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const resolvedParams = await params;
    await dbConnect();
    const { status, reason } = await request.json();

    const validStatuses = ['pending', 'confirmed', 'packing', 'shipped', 'delivered', 'cancelled', 'return', 'cod_pending'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const existing = await Order.findById(resolvedParams.id);
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    // cancelled/return are terminal — once set, the order can't be moved again
    // (this also protects against double-restocking inventory below)
    if (['cancelled', 'return'].includes(existing.status)) {
      return NextResponse.json({ error: 'This order is already finalized and cannot be changed' }, { status: 400 });
    }

    const update = { status, updatedAt: new Date() };
    if (['cancelled', 'return'].includes(status) && reason) {
      update.cancelReason = reason;
    }

    const order = await Order.findByIdAndUpdate(
      resolvedParams.id,
      update,
      { new: true }
    );

    if (status === 'cancelled') {
      await applyOrderStockChange(order, { direction: 1, reason: 'order_cancelled' });
    } else if (status === 'return') {
      await applyOrderStockChange(order, { direction: 1, reason: 'order_returned' });
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
