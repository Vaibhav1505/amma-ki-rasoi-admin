import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function PATCH(request, { params }) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const resolvedParams = await params;
    await dbConnect();
    const { internalNote } = await request.json();

    const order = await Order.findByIdAndUpdate(
      resolvedParams.id,
      { internalNote, updatedAt: new Date() },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
