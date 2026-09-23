// Below this many grams remaining, a product shows up as "low stock" in the
// dashboard, reports, and the WhatsApp low-stock alert. 5kg — adjust to taste.
//
// This constant lives in its own file, with no other imports, on purpose:
// lib/inventory.js pulls in Mongoose models (Product, StockMovement), which
// is fine for server-only code but breaks the build if a Client Component
// imports it (Mongoose needs Node's `async_hooks`, which doesn't exist in
// the browser). Anything that only needs this number — including client
// components like the admin Products table's search/filter UI — should
// import it from here instead of from lib/inventory.js.
export const LOW_STOCK_THRESHOLD_GRAMS = 5000;
