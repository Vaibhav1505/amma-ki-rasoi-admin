import mongoose from 'mongoose';

// Canonical Counter schema — shared shape between amma_ki_rasoi (storefront)
// and amma_ki_rasoi_admin. The two repos each keep their own copy of this
// file today; keep them byte-identical when editing either one. Both apps
// increment the SAME `orderId` counter document (one `counters` collection
// in the shared database), so website orders and admin-entered orders share
// one business-wide order numbering sequence.
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

export default mongoose.models.Counter || mongoose.model('Counter', CounterSchema);
