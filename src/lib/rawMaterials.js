import Product from './models/Product';
import RawMaterial from './models/RawMaterial';
import RawMaterialMovement from './models/RawMaterialMovement';
import StockMovement from './models/StockMovement';

// Below this many grams remaining, a raw material shows up as "low stock" —
// same idea as LOW_STOCK_THRESHOLD_GRAMS in lib/inventory.js. 5kg — adjust
// to taste.
export const LOW_STOCK_THRESHOLD_GRAMS = 5000;

// Logs a production batch: given a finished product and how many grams of
// it were just made, deducts every recipe ingredient's required amount
// (scaled to the batch size) from raw material stock, then adds the batch
// to the product's finished stock. A product with no recipe lines just adds
// finished stock with zero raw-material deduction.
//
// All-or-nothing and race-safe: each raw material deduction uses the same
// conditional-update trick as storefront checkout —
// RawMaterial.updateOne({ _id, stockGrams: { $gte: needed } }, { $inc: ... })
// — so two batches racing for the same jar of elaichi can't both succeed.
// If any ingredient doesn't have enough stock, the whole batch is rejected
// and anything already deducted for it is rolled back (same pattern as
// applyOrderStockChange's rollback in lib/inventory.js).
export async function logProductionBatch({ productId, batchGrams }) {
  if (!productId || !batchGrams || batchGrams <= 0) {
    throw new Error('Enter a batch size greater than 0.');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Product not found.');
  }

  const recipe = product.recipe || [];
  const deducted = []; // { rawMaterialId, grams } already taken — for rollback on failure

  try {
    for (const line of recipe) {
      const gramsNeeded = Math.round(line.gramsPerKg * (batchGrams / 1000));
      if (gramsNeeded <= 0) continue;

      const result = await RawMaterial.updateOne(
        { _id: line.rawMaterial, stockGrams: { $gte: gramsNeeded } },
        { $inc: { stockGrams: -gramsNeeded } }
      );

      if (result.matchedCount === 0) {
        const rawMaterial = await RawMaterial.findById(line.rawMaterial).lean();
        const name = rawMaterial?.name || 'A raw material';
        throw new Error(`Not enough ${name} in stock for this batch.`);
      }

      deducted.push({ rawMaterialId: line.rawMaterial, grams: gramsNeeded });
    }

    // Every ingredient was successfully deducted (or there was no recipe at
    // all) — add the finished stock and write the audit trail.
    await Product.updateOne({ _id: productId }, { $inc: { stockGrams: batchGrams } });
    await StockMovement.create({ product: productId, change: batchGrams, reason: 'production_batch' });

    for (const d of deducted) {
      await RawMaterialMovement.create({
        rawMaterial: d.rawMaterialId,
        change: -d.grams,
        reason: 'production_batch',
        product: productId
      });
    }
  } catch (err) {
    // Roll back whatever raw material stock was already taken before the
    // failure, so a blocked batch never leaves partial deductions behind.
    for (const d of deducted) {
      await RawMaterial.updateOne({ _id: d.rawMaterialId }, { $inc: { stockGrams: d.grams } });
    }
    throw err;
  }
}
