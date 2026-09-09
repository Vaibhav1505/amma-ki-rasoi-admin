import mongoose from 'mongoose';

// Canonical Customer schema — shared shape between amma_ki_rasoi (storefront)
// and amma_ki_rasoi_admin. The two repos each keep their own copy of this
// file today; keep them byte-identical when editing either one.
//
// Customers are still primarily derived from Order history (name, address,
// spend) — this model only holds CRM data that has no natural home on an
// order: tags and internal notes, keyed by phone number.
const CustomerSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    tags: { type: [String], default: [] },
    internalNote: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
