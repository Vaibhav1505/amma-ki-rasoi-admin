import mongoose from 'mongoose';

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
