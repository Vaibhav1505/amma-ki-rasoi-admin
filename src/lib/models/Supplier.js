import mongoose from 'mongoose';

// Suppliers raw materials are bought from — a simple directory so contact
// info lives in one place instead of being retyped on every raw material.
// Admin-only concept: the storefront never reads this model.
const SupplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g. 'XYZ Pvt Ltd'
    contactPerson: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.models.Supplier || mongoose.model('Supplier', SupplierSchema);
