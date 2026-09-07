import Invoice from './models/Invoice';
import Counter from './models/Counter';

// Returns the existing invoice for an order, or issues the next sequential
// invoice number and creates one. Invoice numbers are stable across reprints
// and independent of the order ID.
export async function getOrCreateInvoice(orderId) {
  let invoice = await Invoice.findOne({ order: orderId }).lean();
  if (invoice) return invoice;

  const counter = await Counter.findByIdAndUpdate(
    'invoiceNumber',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const invoiceNumber = `INV-${String(counter.seq).padStart(4, '0')}`;

  try {
    const created = await Invoice.create({ invoiceNumber, order: orderId });
    return created.toObject();
  } catch (error) {
    // Another concurrent request may have created it between our findOne and create
    if (error.code === 11000) {
      invoice = await Invoice.findOne({ order: orderId }).lean();
      if (invoice) return invoice;
    }
    throw error;
  }
}
