#!/usr/bin/env node
// One-off repricing: applies the Sep 2026 price/MRP updates (23 products,
// all variants) that were already applied to the local dev database, plus
// one product rename (Honey -> Honeycomb Extracted Raw Honey, with an
// updated subtitle). Source of truth for the new numbers was the pricing
// spreadsheet the owner edited and sent back on 2026-09-24.
//
// Only touches `variants` (and `name`/`subtitle` for the one renamed
// product) via a partial update — every other field on each product
// document (stockGrams, category, slug, badge, images, etc.) is left
// exactly as it is in whatever database this is pointed at.
//
// Dry-run by default; pass --apply to actually write.
//
//   node scripts/apply-sep2026-repricing.mjs                    # dry run against local db
//   node scripts/apply-sep2026-repricing.mjs --apply             # writes changes, local db
//   node scripts/apply-sep2026-repricing.mjs "<atlas-uri>"       # dry run against a custom URI (e.g. production Atlas)
//   node scripts/apply-sep2026-repricing.mjs --apply "<atlas-uri>"  # writes changes, custom URI
//
// IMPORTANT: the Atlas connection string must include a database name
// (e.g. ".../amma_ki_rasoi?retryWrites=true...") — a URI with no path
// segment after the host connects to Mongo's default "test" database,
// which is almost certainly not what you want. This script prints the
// exact database name it connected to before touching anything, so you
// can double check it in the dry run before ever passing --apply.
import mongoose from 'mongoose';
import Product from '../src/lib/models/Product.js';

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const uriArg = args.find(a => !a.startsWith('--'));
const MONGODB_URI = uriArg || process.env.MONGODB_URI || 'mongodb://localhost:27017/amma_ki_rasoi';

// Minimal per-product update: only the fields that actually changed.
// variants arrays are the FULL new variant list for that product (in the
// same order/weights as before), so this is a straight replace of that
// one field, not a merge.
//
// Matched by SLUG, not _id: the local dev database and production Atlas
// were seeded independently and have different ObjectIds for the "same"
// product, but slug is the stable identifier used in storefront URLs
// (e.g. ammakirasoi.com/product/aam-achaar), so it's the one thing that
// should line up across both databases. The `id` field below is kept
// only as a comment/reference to the local dev document, not used for
// lookup.
const UPDATES = [
  { slug: 'mix-daal-badi', id: '6ab391e24733a9bafd3f502c', variants: [
    { weight: '250g', price: 229, mrp: 249 },
    { weight: '500g', price: 429, mrp: 469 },
  ]},
  { slug: 'moong-badi', id: '6aa078e5b13884afb88546a7', variants: [
    { weight: '250g', price: 189, mrp: 209 },
    { weight: '500g', price: 365, mrp: 399 },
  ]},
  { slug: 'urad-badi', id: '6aa078e5b13884afb88546a6', variants: [
    { weight: '250g', price: 199, mrp: 219 },
    { weight: '500g', price: 389, mrp: 429 },
  ]},
  { slug: 'pure-honey', id: '6aa078e5b13884afb88546b2', variants: [
    { weight: '250g', price: 299, mrp: 349 },
    { weight: '500g', price: 569, mrp: 649 },
    { weight: '1kg', price: 999, mrp: 1199 },
  ], name: 'Honeycomb Extracted Raw Honey', subtitle: 'छत्ते से निकाला शुद्ध कच्चा शहद — अनहीटेड, अनफ़िल्टर्ड' },
  { slug: 'namkeen-daal-moth', id: '6aa078e5b13884afb88546af', variants: [
    { weight: '250g', price: 199, mrp: 225 },
    { weight: '500g', price: 379, mrp: 420 },
  ]},
  { slug: 'namkeen-khatta-meetha', id: '6aa078e5b13884afb88546ad', variants: [
    { weight: '250g', price: 179, mrp: 199 },
    { weight: '500g', price: 339, mrp: 379 },
  ]},
  { slug: 'mathri', id: '6aa078e5b13884afb88546ac', variants: [
    { weight: '250g', price: 169, mrp: 189 },
    { weight: '500g', price: 319, mrp: 349 },
  ]},
  { slug: 'namkeen-mixture', id: '6aa078e5b13884afb88546b1', variants: [
    { weight: '250g', price: 169, mrp: 189 },
    { weight: '500g', price: 319, mrp: 349 },
  ]},
  { slug: 'namkeen-moong-dal', id: '6aa078e5b13884afb88546b0', variants: [
    { weight: '250g', price: 189, mrp: 209 },
    { weight: '500g', price: 359, mrp: 399 },
  ]},
  { slug: 'namakpara', id: '6aa078e5b13884afb88546ab', variants: [
    { weight: '250g', price: 149, mrp: 169 },
    { weight: '500g', price: 279, mrp: 309 },
  ]},
  { slug: 'namkeen-teekha', id: '6aa078e5b13884afb88546ae', variants: [
    { weight: '250g', price: 179, mrp: 199 },
    { weight: '500g', price: 339, mrp: 379 },
  ]},
  { slug: 'aam-adrak-mircha-achaar', id: '6aa078e5b13884afb88546a4', variants: [
    { weight: '250g', price: 239, mrp: 259 },
    { weight: '500g', price: 429, mrp: 459 },
    { weight: '1kg', price: 819, mrp: 899 },
  ]},
  { slug: 'aam-karela-achaar', id: '6aa078e5b13884afb88546a2', variants: [
    { weight: '250g', price: 239, mrp: 259 },
    { weight: '500g', price: 429, mrp: 459 },
    { weight: '1kg', price: 819, mrp: 899 },
  ]},
  { slug: 'aam-mircha-achaar', id: '6aa078e5b13884afb88546a3', variants: [
    { weight: '250g', price: 239, mrp: 259 },
    { weight: '500g', price: 429, mrp: 459 },
    { weight: '1kg', price: 819, mrp: 899 },
  ]},
  { slug: 'aam-achaar', id: '6aa078e5b13884afb885469d', variants: [
    { weight: '250g', price: 199, mrp: 219 },
    { weight: '500g', price: 389, mrp: 419 },
    { weight: '1kg', price: 749, mrp: 829 },
  ]},
  { slug: 'hara-lahsun-achaar', id: '6aa078e5b13884afb88546a0', variants: [
    { weight: '250g', price: 159, mrp: 179 },
    { weight: '500g', price: 299, mrp: 329 },
    { weight: '1kg', price: 569, mrp: 629 },
  ]},
  { slug: 'hara-mircha-achaar', id: '6aa078e5b13884afb88546a5', variants: [
    { weight: '250g', price: 239, mrp: 259 },
    { weight: '500g', price: 429, mrp: 459 },
    { weight: '1kg', price: 819, mrp: 899 },
  ]},
  { slug: 'karela-achaar', id: '6aa078e5b13884afb88546a1', variants: [
    { weight: '250g', price: 239, mrp: 259 },
    { weight: '500g', price: 429, mrp: 459 },
    { weight: '1kg', price: 819, mrp: 899 },
  ]},
  { slug: 'kathal-achaar', id: '6aa078e5b13884afb885469e', variants: [
    { weight: '250g', price: 199, mrp: 219 },
    { weight: '500g', price: 389, mrp: 419 },
    { weight: '1kg', price: 749, mrp: 829 },
  ]},
  { slug: 'laal-bharua', id: '6aa078e5b13884afb885469f', variants: [
    { weight: '250g', price: 259, mrp: 279 },
    { weight: '500g', price: 459, mrp: 499 },
    { weight: '1kg', price: 879, mrp: 959 },
  ]},
  { slug: 'gujiya', id: '6aa078e5b13884afb88546aa', variants: [
    { weight: '250g', price: 239, mrp: 269 },
    { weight: '500g', price: 459, mrp: 519 },
  ]},
  { slug: 'thekua-gud', id: '6aa078e5b13884afb88546a9', variants: [
    { weight: '250g', price: 199, mrp: 229 },
    { weight: '500g', price: 389, mrp: 439 },
  ]},
  { slug: 'thekua-traditional', id: '6aa078e5b13884afb88546a8', variants: [
    { weight: '250g', price: 199, mrp: 229 },
    { weight: '500g', price: 389, mrp: 439 },
  ]},
];

function fmtVariants(variants) {
  return variants.map(v => `${v.weight}: Rs.${v.price}${v.mrp ? ` (mrp Rs.${v.mrp})` : ''}`).join(', ');
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  const dbName = mongoose.connection.name;
  console.log(`Connected to database "${dbName}".`);
  console.log(`${apply ? 'APPLYING' : 'DRY RUN — pass --apply to write'} changes.\n`);
  if (dbName === 'test') {
    console.log('WARNING: connected database is "test" — your URI probably has no database name in it.');
    console.log('Add the db name to the URI path (e.g. .../amma_ki_rasoi?retryWrites=...) and re-run.\n');
  }

  const allProducts = await Product.find({});
  console.log(`This database has ${allProducts.length} product(s) total.\n`);

  let matched = 0;
  let missing = 0;
  const matchedIds = new Set();

  for (const u of UPDATES) {
    const product = await Product.findOne({ slug: u.slug });
    if (!product) {
      console.log(`- [NOT FOUND] slug "${u.slug}" — skipping (no product with this slug in this database)`);
      missing++;
      continue;
    }
    matched++;
    matchedIds.add(String(product._id));

    console.log(`- ${product.name}  (slug: ${product.slug})`);
    console.log(`    variants: ${fmtVariants(product.variants)}`);
    console.log(`         ->   ${fmtVariants(u.variants)}`);
    if (u.name && u.name !== product.name) {
      console.log(`    name: "${product.name}" -> "${u.name}"`);
    }
    if (u.subtitle && u.subtitle !== product.subtitle) {
      console.log(`    subtitle: "${product.subtitle || ''}" -> "${u.subtitle}"`);
    }

    if (apply) {
      const set = { variants: u.variants, updatedAt: new Date() };
      if (u.name) set.name = u.name;
      if (u.subtitle) set.subtitle = u.subtitle;
      await Product.findByIdAndUpdate(product._id, set, { runValidators: true });
    }
  }

  const unmatchedInDb = allProducts.filter(p => !matchedIds.has(String(p._id)));
  if (unmatchedInDb.length) {
    console.log(`\n${unmatchedInDb.length} product(s) in this database were NOT in the update list (left untouched):`);
    for (const p of unmatchedInDb) {
      console.log(`  - ${p.name}  (slug: ${p.slug})`);
    }
  }

  console.log(`\n${apply ? 'Updated' : 'Would update'} ${matched} product(s).${missing ? ` ${missing} slug(s) from the update list not found in this database.` : ''}`);
  if (!apply) {
    console.log('Re-run with --apply (same URI) to write these changes.');
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
