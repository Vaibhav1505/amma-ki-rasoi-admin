#!/usr/bin/env node
// One-time migration: move from per-variant unit stock (e.g. "40 jars of
// 250g" tracked separately from "15 jars of 1kg") to a single per-product
// stock pool in grams (Product.stockGrams). Every product's stockGrams
// starts at 0 after this runs — go to Admin > Products afterward and enter
// the real current total (in kg) for each one; there's no way to infer a
// true bulk total from the old per-size unit counts.
//
// Dry-run by default; pass --apply to actually write.
//
//   node scripts/migrate-stock-to-weight.mjs                # dry run
//   node scripts/migrate-stock-to-weight.mjs --apply         # writes changes
//   node scripts/migrate-stock-to-weight.mjs --apply <uri>   # custom URI
import mongoose from 'mongoose';

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const uriArg = args.find(a => !a.startsWith('--'));
const MONGODB_URI = uriArg || process.env.MONGODB_URI || 'mongodb://localhost:27017/amma_ki_rasoi';

async function main() {
  await mongoose.connect(MONGODB_URI);
  const col = mongoose.connection.db.collection('products');

  const products = await col.find({}).toArray();
  let candidates = 0;

  for (const doc of products) {
    const hasOldStock = (doc.variants || []).some(v => v.stock !== undefined);
    const hasStockGrams = doc.stockGrams !== undefined;
    if (!hasOldStock && hasStockGrams) continue; // already migrated

    candidates++;
    const oldSummary = (doc.variants || []).map(v => `${v.weight}=${v.stock ?? 0}`).join(', ') || '(no variants)';
    console.log(`- ${doc.slug}: ${oldSummary} -> stockGrams: 0 (set the real total in Admin > Products after this run)`);

    if (apply) {
      const cleanedVariants = (doc.variants || []).map(v => ({ weight: v.weight, price: v.price, mrp: v.mrp }));
      await col.updateOne(
        { _id: doc._id },
        { $set: { variants: cleanedVariants, stockGrams: hasStockGrams ? doc.stockGrams : 0 } }
      );
    }
  }

  console.log(`\n${apply ? 'Migrated' : 'Found'} ${candidates} product document(s) out of ${products.length} total.${apply ? '' : ' Re-run with --apply to write changes.'}`);
  if (apply && candidates > 0) {
    console.log('\nEvery migrated product now starts at 0kg stock. Go to Admin > Products and enter the real current stock (in kg) for each one before customers can order it.');
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
