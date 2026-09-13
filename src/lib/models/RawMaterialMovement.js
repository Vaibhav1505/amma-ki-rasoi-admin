import mongoose from 'mongoose';

// Audit trail for raw material stock changes — mirrors StockMovement.js's
// shape. Admin-only concept: the storefront never reads this model.
const RawMaterialMovementSchema = new mongoose.Schema(
  {
    rawMaterial: { type: mongoose.Schema.Types.ObjectId, ref: 'RawMaterial', required: true },
    change: { type: Number, required: true }, // positive = stock added (restock), negative = consumed (production batch)
    reason: {
      type: String,
      enum: ['restock', 'production_batch', 'manual_adjustment'],
      required: true
    },
    // When reason is 'production_batch', which finished product the raw
    // material was consumed to make.
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
  },
  { timestamps: true }
);

export default mongoose.models.RawMaterialMovement || mongoose.model('RawMaterialMovement', RawMaterialMovementSchema);
