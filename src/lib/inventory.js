import Product from './models/Product.js';
import StockMovement from './models/StockMovement.js';
import { gramsForWeight } from './weight.js';

// Re-exported here so existing server-side imports (`from '../lib/inventory'`)
// keep working unchanged. The actual value lives in its own mongoose-free
// file — see lib/stockThreshold.js for why — and any Client Component
// should import it from there directly instead of from this file.
export { LOW_STOCK_THRESHOLD_GRAMS } from './stockThreshold.js';

// Adjusts a product's total stock pool (in grams) and records the movement
// for audit purposes. `changeGrams` is signed: negative removes stock,
// positive adds it back.
export async function adjustStock({ productId, changeGrams, reason, orderId }) {
  if (!productId || !changeGrams) return;
  await Product.updateOne(
    { _id: productId },
    { $inc: { stockGrams: changeGrams } }
  );
  await StockMovement.create({ product: productId, change: changeGrams, reason, order: orderId });
}

// Applies stock movement for every product-linked item on an order. Each
// item's weight is converted to grams (quantity * gramsForWeight(weight))
// since stock is tracked once per product, not per package size — see
// lib/weight.js.
// direction: -1 to deduct stock (order placed), +1 to restore it (cancelled/returned)
export async function applyOrderStockChange(order, { direction, reason }) {
  for (const item of order.items) {
    if (!item.product) continue; // freeform/custom items aren't tracked in inventory
    const grams = gramsForWeight(item.weight) * item.quantity;
    if (!grams) continue; // no weight on this item (legacy order, or freeform) — nothing to adjust
    await adjustStock({
      productId: item.product,
      changeGrams: direction * grams,
      reason,
      orderId: order._id
    });
  }
}
