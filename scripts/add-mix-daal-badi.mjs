#!/usr/bin/env node
// One-off: adds the "Mix Daal Badi" product, which exists in local dev but
// was missing from production (discovered while running
// apply-sep2026-repricing.mjs against production Atlas on 2026-09-24).
// Uses the NEW Sep 2026 pricing directly (not the old local-dev price),
// so this product goes live already repriced.
//
// Safe to run more than once: if a product with this slug already exists
// in the target database, it's skipped rather than duplicated.
//
// Dry-run by default; pass --apply to actually write.
//
//   node scripts/add-mix-daal-badi.mjs                    # dry run, local db
//   node scripts/add-mix-daal-badi.mjs --apply             # writes, local db
//   node scripts/add-mix-daal-badi.mjs "<atlas-uri>"       # dry run, custom URI
//   node scripts/add-mix-daal-badi.mjs --apply "<atlas-uri>"  # writes, custom URI
import mongoose from 'mongoose';
import Product from '../src/lib/models/Product.js';

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const uriArg = args.find(a => !a.startsWith('--'));
const MONGODB_URI = uriArg || process.env.MONGODB_URI || 'mongodb://localhost:27017/amma_ki_rasoi';

const NEW_PRODUCT = {
  slug: 'mix-daal-badi',
  name: 'Mix Daal Badi',
  subtitle: 'Goodness of Multiple Lentils & Indian Spices',
  images: ['/mix_daal_badi.png'],
  description: 'A wholesome blend of chana (chickpea), matar (green peas), and urad (black gram) dal, seasoned with a hearty garam masala blend of traditional Indian spices. High in protein, rich in fiber, and made the traditional homemade way — no preservatives.',
  ingredients: ['Chana (Chickpea)', 'Matar (Green Peas)', 'Urad (Black Gram)', 'Garam Masala'],
  category: 'Badi',
  badge: '',
  variants: [
    { weight: '250g', price: 229, mrp: 249 },
    { weight: '500g', price: 429, mrp: 469 },
  ],
  stockGrams: 20000,
};

async function main() {
  await mongoose.connect(MONGODB_URI);
  const dbName = mongoose.connection.name;
  console.log(`Connected to database "${dbName}".`);
  console.log(`${apply ? 'APPLYING' : 'DRY RUN — pass --apply to write'} changes.\n`);

  const existing = await Product.findOne({ slug: NEW_PRODUCT.slug });
  if (existing) {
    console.log(`Product with slug "${NEW_PRODUCT.slug}" already exists in this database (id ${existing._id}) — nothing to do.`);
    await mongoose.disconnect();
    return;
  }

  console.log('Would create:');
  console.log(JSON.stringify(NEW_PRODUCT, null, 2));
  console.log('\nIMPORTANT: this only creates the database record. The image file');
  console.log(`(public${NEW_PRODUCT.images[0]}) must already be deployed on the live`);
  console.log('site for it to actually display — check that mix_daal_badi.png was');
  console.log('committed to the storefront repo and is part of the live deploy.');

  if (apply) {
    const created = await Product.create(NEW_PRODUCT);
    console.log(`\nCreated product id ${created._id}.`);
  } else {
    console.log('\nRe-run with --apply (same URI) to create this product.');
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
