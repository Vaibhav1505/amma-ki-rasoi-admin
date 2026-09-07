import Customer from './models/Customer';

// Normalizes a phone number to its last 10 digits so differently-formatted
// numbers for the same person ("+91 98765 43210", "9876543210") compare equal.
export function normalizePhone(phone) {
  return (phone || '').replace(/\D/g, '').slice(-10);
}

// Makes sure a Customer record exists for this phone so CRM data (tags,
// notes) has somewhere to live. Never overwrites existing tags/notes.
export async function ensureCustomer(phone) {
  if (!phone) return;
  await Customer.findOneAndUpdate(
    { phone },
    { $setOnInsert: { phone, tags: [], internalNote: '' } },
    { upsert: true }
  );
}
