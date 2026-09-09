import mongoose from 'mongoose';

// Canonical Order schema — shared shape between amma_ki_rasoi (storefront)
// and amma_ki_rasoi_admin. The two repos each keep their own copy of this
// file today; keep them byte-identical when editing either one. Extracting
// this into one real shared package instead of two hand-synced copies is
// tracked as a follow-up in the build backlog ("Extract shared schemas into
// one package").
const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // omitted for freeform/custom items
  productName: { type: String, required: true },
  weight: { type: String }, // '250g' | '500g' | '1kg' — omitted for freeform/custom items. Needed to convert quantity into grams for stock deduction (see lib/inventory.js / api/orders stock logic).
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }
});

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'packing', 'shipped', 'delivered', 'cancelled', 'return', 'cod_pending'],
      default: 'pending'
    },
    paymentMethod: { type: String, enum: ['UPI', 'COD', 'Cash', 'Bank Transfer'], required: true },
    paymentStatus: { type: String, enum: ['Paid', 'Pending'], required: true },
    shippingAddress: { type: String, required: true },
    customerNote: { type: String },
    internalNote: { type: String },
    cancelReason: { type: String },
    orderSource: { type: String, default: 'Website' },
    courierName: { type: String },
    awbNumber: { type: String },
    trackingUrl: { type: String },
    shiprocketShipmentId: { type: String },
    shiprocketOrderId: { type: String },
    pickupScheduled: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
