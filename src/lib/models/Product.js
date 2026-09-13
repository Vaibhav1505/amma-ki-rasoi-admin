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

// Optional recipe (bill of materials): how many grams of each raw material
// go into making 1kg of this finished product. Purely an admin concept —
// the RawMaterial ref only resolves in amma_ki_rasoi_admin, since raw
// materials are never read or shown on the storefront. A product with no
// recipe lines just isn't tracked against raw material stock — logging a
// production batch for it only adds finished stock. Scales to any batch
// size: gramsNeeded = gramsPerKg * (batchGrams / 1000). See lib/rawMaterials.js.
const RecipeLineSchema = new mongoose.Schema(
  {
    rawMaterial: { type: mongoose.Schema.Types.ObjectId, ref: 'RawMaterial', required: true },
    gramsPerKg: { type: Number, required: true, min: 0 }
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
    stockGrams: { type: Number, default: 0, min: 0 },
    recipe: { type: [RecipeLineSchema], default: [] }
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
