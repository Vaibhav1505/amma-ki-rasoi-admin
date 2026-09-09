import mongoose from 'mongoose';

// Singleton document (fixed _id) holding the business profile used on
// invoices, shipping labels, and (eventually) other customer-facing docs.
const BusinessSettingsSchema = new mongoose.Schema(
  {
    _id: { type: String, default: 'business' },
    name: { type: String, default: 'Amma Ki Rasoi' },
    tagline: { type: String, default: 'घर के स्वाद की परंपरा' },
    ownerName: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: 'Lucknow' },
    state: { type: String, default: 'Uttar Pradesh' },
    pincode: { type: String, default: '' },
    fssaiNumber: { type: String, default: '' },
    gstNumber: { type: String, default: '' },
    // Off by default (this business isn't GST-registered as of this
    // writing). When it is: product prices stay exactly as entered in
    // ProductForm — they're treated as GST-inclusive, same as almost every
    // D2C food brand — and gstRatePercent is used to back the tax amount
    // out of that price for display on invoices, not to add anything on
    // top of what customers pay. Confirm the correct rate per product
    // category (pickles/namkeen/sweets/honey can differ) with a CA before
    // relying on this for real filing.
    gstRegistered: { type: Boolean, default: false },
    gstRatePercent: { type: Number, default: 0 },
    bankName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    upiId: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.models.BusinessSettings || mongoose.model('BusinessSettings', BusinessSettingsSchema);
