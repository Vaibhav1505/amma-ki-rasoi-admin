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
    bankName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    upiId: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.models.BusinessSettings || mongoose.model('BusinessSettings', BusinessSettingsSchema);
