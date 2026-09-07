import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { adjustStock } from '@/lib/inventory';
import { ensureCustomer } from '@/lib/customers';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

// Sums quantities per linked product, e.g. { "<productId>": 3 }
function quantitiesByProduct(items) {
  const map = new Map();
  (items || []).forEach((item) => {
    if (!item.product) return;
    const key = String(item.product);
    map.set(key, (map.get(key) || 0) + item.quantity);
  });
  return map;
}

// Edits order contents (customer/shipping/payment/items).
// Status changes go through /api/orders/[id]/status instead.
export async function PUT(request, { params }) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const resolvedParams = await params;
    await dbConnect();
    const body = await request.json();

    const {
      customerName, customerPhone, customerEmail, shippingAddress,
      orderSource, paymentMethod, paymentStatus, customerNote,
      items, totalAmount
    } = body;

    const before = await Order.findById(resolvedParams.id).lean();
    if (!before) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    if (['cancelled', 'return'].includes(before.status)) {
      return NextResponse.json({ error: 'This order is finalized and cannot be edited' }, { status: 400 });
    }

    const order = await Order.findByIdAndUpdate(
      resolvedParams.id,
      {
        customerName, customerPhone, customerEmail, shippingAddress,
        orderSource, paymentMethod, paymentStatus, customerNote,
        items, totalAmount, updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    await ensureCustomer(order.customerPhone);

    // Reconcile stock for any change in quantity of a product-linked item
    // (e.g. quantity 2 -> 5 needs to pull 3 more units from inventory)
    const beforeQty = quantitiesByProduct(before.items);
    const afterQty = quantitiesByProduct(items);
    const productIds = new Set([...beforeQty.keys(), ...afterQty.keys()]);
    for (const productId of productIds) {
      const delta = (beforeQty.get(productId) || 0) - (afterQty.get(productId) || 0);
      if (delta !== 0) {
        await adjustStock({ productId, change: delta, reason: 'order_edited', orderId: order._id });
      }
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
