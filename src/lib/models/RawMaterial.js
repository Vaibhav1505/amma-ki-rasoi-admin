import mongoose from 'mongoose';

// Raw materials (ingredients bought in bulk — mustard oil, sugar, elaichi,
// moongfali, etc.) used to make finished products. Admin-only concept: the
// storefront never reads this model. Stock is tracked in grams internally
// (same pattern as Product.stockGrams) even though the UI always shows kg.
const RawMaterialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g. 'Mustard Oil'
    stockGrams: { type: Number, default: 0, min: 0 },
    // Who this is bought from — see the Suppliers module (lib/models/Supplier.js).
    // Optional: a raw material doesn't need a known supplier yet.
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', default: null },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.models.RawMaterial || mongoose.model('RawMaterial', RawMaterialSchema);
