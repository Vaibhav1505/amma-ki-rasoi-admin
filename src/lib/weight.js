// Canonical weight helpers — shared between amma_ki_rasoi (storefront) and
// amma_ki_rasoi_admin. The two repos each keep their own copy of this file
// today; keep them byte-identical when editing either one.
//
// Package sizes are a fixed set for now: 250g, 500g, 1kg. Stock is tracked
// ONCE per product as total remaining weight in grams (Product.stockGrams)
// — not per package size. A 200kg batch of kathal achaar is one number
// regardless of whether it sells as 250g, 500g or 1kg jars; every order
// deducts quantity * gramsForWeight(variant.weight) from that one pool.
// These helpers convert between grams and the weight strings used on
// variants and order line items.
export const GRAMS_PER_WEIGHT = { '250g': 250, '500g': 500, '1kg': 1000 };
export const WEIGHT_OPTIONS = Object.keys(GRAMS_PER_WEIGHT);

export function gramsForWeight(weight) {
  return GRAMS_PER_WEIGHT[weight] || 0;
}

export function gramsToKg(grams) {
  return (grams || 0) / 1000;
}

export function kgToGrams(kg) {
  return Math.round(Number(kg || 0) * 1000);
}

// Formats a gram amount as a trimmed kg string for display, e.g.
// 200000 -> "200", 198500 -> "198.5", 2000 -> "2".
export function formatKg(grams) {
  const kg = gramsToKg(grams);
  return (Math.round(kg * 100) / 100).toString();
}
