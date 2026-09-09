// One-time migration: converts legacy flat-shape Product documents
// ({ price, weight, image, stock, ... } at the top level — how admin
// created products before the schema unification) into the canonical
// shape shared with the storefront ({ images: [...], variants: [{ weight,
// price, mrp, stock }] }).
//
// Safe to run more than once — it only touches documents that don't
// already have a `variants` array, so already-migrated (or
// storefront-seeded) documents are left untouched.
//
// Usage:
//   node scripts/migrate-product-schema.mjs                 # dry run — reports what it would change
//   node scripts/migrate-product-schema.mjs --apply          # actually writes the changes
//   node scripts/migrate-product-schema.mjs --apply "<uri>"  # against a specific MongoDB URI
//
// Run this BEFORE deploying/restarting with the new src/lib/models/Product.js
// schema — it writes through the raw collection (bypassing Mongoose schema
// validation), so it works fine against the old data even after the new
// schema file is in place.

import mongoose from 'mongoose';

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const uriArg = args.find(a => !a.startsWith('--'));
const MONGODB_URI = uriArg || process.env.MONGODB_URI || 'mongodb://localhost:27017/amma_ki_rasoi';

async function main() {
  console.log(`Connecting to ${MONGODB_URI} ${apply ? '(APPLY mode — will write changes)' : '(dry run — no changes will be written)'}`);
  await mongoose.connect(MONGODB_URI);
  const products = mongoose.connection.db.collection('products');

  // Legacy shape: no `variants` array yet.
  const legacyDocs = await products.find({ variants: { $exists: false } }).toArray();
  const total = await products.countDocuments();

  console.log(`Found ${legacyDocs.length} legacy-shape product document(s) out of ${total} total.`);

  if (legacyDocs.length === 0) {
    console.log('Nothing to migrate.');
    await mongoose.disconnect();
    return;
  }

  let migrated = 0;
  for (const doc of legacyDocs) {
    const weight = doc.weight || '';
    const price = typeof doc.price === 'number' ? doc.price : 0;
    const stock = typeof doc.stock === 'number' ? doc.stock : 0;
    const images = doc.images && Array.isArray(doc.images) && doc.images.length > 0
      ? doc.images
      : (doc.image ? [doc.image] : []);

    const update = {
      $set: {
        images,
        variants: [
          { weight, price, mrp: price, stock }
        ]
      },
      $unset: { price: '', weight: '', image: '', stock: '' }
    };

    console.log(`  ${apply ? 'Migrating' : 'Would migrate'}: "${doc.name || doc.slug || doc._id}" -> variants: [{ weight: "${weight}", price: ${price}, mrp: ${price}, stock: ${stock} }], images: ${JSON.stringify(images)}`);

    if (apply) {
      await products.updateOne({ _id: doc._id }, update);
    }
    migrated++;
  }

  console.log(`${apply ? 'Migrated' : 'Would migrate'} ${migrated} document(s).`);
  if (!apply) {
    console.log('\nRe-run with --apply to actually write these changes.');
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
