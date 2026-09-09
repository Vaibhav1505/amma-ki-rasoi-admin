import mongoose from 'mongoose';

// Canonical Product schema — shared shape between amma_ki_rasoi (storefront)
// and amma_ki_rasoi_admin. The two repos each keep their own copy of this
// file today; keep them byte-identical when editing either one. Extracting
// this into one real shared package instead of two hand-synced copies is
// tracked as a follow-up in the build backlog ("Extract shared schemas into
// one package").
//
// Stock is tracked ONCE per product, as total remaining weight in grams
// (stockGrams) — not per package size. See lib/weight.js for the weight
// <-> grams helpers used wherever stock math happens.
const VariantSchema = new mongoose.Schema(
  {
    weight: { type: String, required: true }, // '250g' | '500g' | '1kg'
    price: { type: Number, required: true },
    mrp: { type: Number, required: true }
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true }, // 'id' from old data.js
    name: { type: String, required: true },
    subtitle: { type: String, required: true },
    images: {
      type: [String],
      required: true,
      validate: v => Array.isArray(v) && v.length > 0
    },
    description: { type: String, required: true },
    ingredients: { type: [String], default: [] },
    category: { type: String, required: true }, // e.g., 'Pickles', 'Badi'
    badge: { type: String },
    variants: {
      type: [VariantSchema],
      required: true,
      validate: v => Array.isArray(v) && v.length > 0
    },
    stockGrams: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
