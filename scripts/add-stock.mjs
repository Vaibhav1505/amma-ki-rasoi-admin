#!/usr/bin/env node
// One-off bulk restock: adds a fixed amount of stock (in grams) to every
// product's stockGrams pool, and records a matching StockMovement audit
// entry for each one (reason: 'manual_adjustment') — the same accounting
// path the rest of the app uses for stock changes (see adjustStock in
// lib/inventory.js), so this shows up correctly in Reports/Stock History.
//
// Dry-run by default; pass --apply to actually write.
//
//   node scripts/add-stock.mjs                       # dry run, +20kg to every product
//   node scripts/add-stock.mjs --apply                # writes changes, +20kg to every product
//   node scripts/add-stock.mjs --apply --grams=15000  # custom amount (in grams)
//   node scripts/add-stock.mjs --apply <uri>          # custom MongoDB URI
import mongoose from 'mongoose';
import Product from '../src/lib/models/Product.js';
import { adjustStock } from '../src/lib/inventory.js';

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const gramsArg = args.find(a => a.startsWith('--grams='));
const CHANGE_GRAMS = gramsArg ? Number(gramsArg.split('=')[1]) : 20000; // 20kg default
const uriArg = args.find(a => !a.startsWith('--'));
const MONGODB_URI = uriArg || process.env.MONGODB_URI || 'mongodb://localhost:27017/amma_ki_rasoi';

async function main() {
  if (!Number.isFinite(CHANGE_GRAMS) || CHANGE_GRAMS <= 0) {
    throw new Error(`Invalid --grams value: ${gramsArg}`);
  }

  await mongoose.connect(MONGODB_URI);
  console.log(`Connected. ${apply ? 'APPLYING' : 'DRY RUN — pass --apply to write'} changes.\n`);

  const products = await Product.find({}).sort({ category: 1, name: 1 });
  console.log(`Found ${products.length} product(s). Adding ${(CHANGE_GRAMS / 1000).toFixed(2)}kg to each.\n`);

  for (const p of products) {
    const before = p.stockGrams ?? 0;
    const after = before + CHANGE_GRAMS;
    console.log(`- ${p.name} (${p.category}): ${(before / 1000).toFixed(2)}kg -> ${(after / 1000).toFixed(2)}kg`);

    if (apply) {
      await adjustStock({
        productId: p._id,
        changeGrams: CHANGE_GRAMS,
        reason: 'manual_adjustment'
      });
    }
  }

  console.log(`\n${apply ? 'Updated' : 'Would update'} ${products.length} product(s).${apply ? '' : ' Re-run with --apply to write changes.'}`);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
