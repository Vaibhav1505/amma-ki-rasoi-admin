import Product from './models/Product';
import StockMovement from './models/StockMovement';

// Adjusts a product's stock and records the movement for audit purposes.
// `change` is signed: negative removes stock, positive adds it back.
export async function adjustStock({ productId, change, reason, orderId }) {
  if (!productId || !change) return;
  await Product.findByIdAndUpdate(productId, { $inc: { stock: change } });
  await StockMovement.create({ product: productId, change, reason, order: orderId });
}

// Applies stock movement for every product-linked item on an order.
// direction: -1 to deduct stock (order placed), +1 to restore it (cancelled/returned)
export async function applyOrderStockChange(order, { direction, reason }) {
  for (const item of order.items) {
    if (!item.product) continue; // freeform/custom items aren't tracked in inventory
    await adjustStock({
      productId: item.product,
      change: direction * item.quantity,
      reason,
      orderId: order._id
    });
  }
}
