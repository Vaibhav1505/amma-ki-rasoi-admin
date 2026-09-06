import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // omitted for freeform/custom items
  productName: { type: String, required: true },
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
    trackingUrl: { type: String }
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
