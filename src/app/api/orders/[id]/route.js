import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { adjustStock } from '@/lib/inventory';
import { ensureCustomer } from '@/lib/customers';
import { gramsForWeight } from '@/lib/weight';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

// Sums grams needed per linked product, e.g. { "<productId>": 2000 }. Stock
// is tracked once per product as total weight, so an edit that changes an
// item's weight (not just its quantity) still needs to reconcile correctly
// — this converts every item to grams before diffing. Items from before this
// field existed (no weight) contribute 0 grams; see lib/inventory.js.
function gramsByProduct(items) {
  const map = new Map();
  (items || []).forEach((item) => {
    if (!item.product) return;
    const grams = gramsForWeight(item.weight) * item.quantity;
    const key = String(item.product);
    map.set(key, (map.get(key) || 0) + grams);
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

    // Reconcile stock for any change in quantity or weight of a
    // product-linked item (e.g. 1kg -> 500g, or quantity 2 -> 5, needs to
    // pull the difference, in grams, from inventory)
    const beforeGrams = gramsByProduct(before.items);
    const afterGrams = gramsByProduct(items);
    const productIds = new Set([...beforeGrams.keys(), ...afterGrams.keys()]);
    for (const productId of productIds) {
      const delta = (beforeGrams.get(productId) || 0) - (afterGrams.get(productId) || 0);
      if (delta !== 0) {
        await adjustStock({ productId, changeGrams: delta, reason: 'order_edited', orderId: order._id });
      }
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
