import mongoose from 'mongoose';

// Canonical StockMovement schema — shared shape between amma_ki_rasoi
// (storefront) and amma_ki_rasoi_admin. The two repos each keep their own
// copy of this file today; keep them byte-identical when editing either one.
const StockMovementSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    change: { type: Number, required: true }, // positive = stock added, negative = stock removed
    reason: {
      type: String,
      enum: ['order_placed', 'order_edited', 'order_cancelled', 'order_returned', 'manual_adjustment'],
      required: true
    },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
  },
  { timestamps: true }
);

export default mongoose.models.StockMovement || mongoose.model('StockMovement', StockMovementSchema);
