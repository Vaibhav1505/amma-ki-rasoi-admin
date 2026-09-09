import Order from './models/Order';
import { applyOrderStockChange } from './inventory';
import { STATUS_MAP } from './shiprocket';

// Applies a courier's free-text status (from a webhook or a manual tracking
// refresh) onto an order, translating it through STATUS_MAP. Returns
// { order, applied } — applied is false if the status was unrecognized,
// the order is already finalized, or nothing changed.
export async function syncOrderStatus(order, rawStatusText) {
  if (['cancelled', 'return'].includes(order.status)) {
    return { order, applied: false };
  }

  const key = (rawStatusText || '').toString().trim().toLowerCase();
  const mappedStatus = STATUS_MAP[key];
  if (!mappedStatus || mappedStatus === order.status) {
    return { order, applied: false };
  }

  const updated = await Order.findByIdAndUpdate(
    order._id,
    { status: mappedStatus, updatedAt: new Date() },
    { new: true }
  );

  if (mappedStatus === 'cancelled') {
    await applyOrderStockChange(updated, { direction: 1, reason: 'order_cancelled' });
  } else if (mappedStatus === 'return') {
    await applyOrderStockChange(updated, { direction: 1, reason: 'order_returned' });
  }

  return { order: updated, applied: true };
}
