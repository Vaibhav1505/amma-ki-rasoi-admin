# Amma Ki Rasoi Admin — Build Roadmap

Living checklist of what's done and what's left to turn this into a complete
order → inventory → invoice → finance system. Update this file as work
lands; don't let it drift from reality.

## Phase 0 — Critical fixes ✅ done
- [x] Unified `Order.status` enum (schema vs. API vs. UI were all speaking different vocabularies)
- [x] Fixed `Order.paymentMethod` enum to match the actual form options (`UPI`/`COD`/`Cash`/`Bank Transfer`)
- [x] Added missing `Order` fields that were silently dropped on save: `customerNote`, `orderSource`, `courierName`, `awbNumber`, `trackingUrl`
- [x] Added missing `Product` fields: `weight`, `badge`
- [x] Added missing `.badge-cancelled` / `.badge-return` / `.badge-cod_pending` CSS
- [x] Replaced race-prone order-ID counter with an atomic `Counter` model
- [x] Fixed Finance page's prepaid/COD revenue split

## Phase 1 — Order management (core workflow) — mostly done
- [x] Dashboard home wired to real DB data (KPIs, needs-attention queue, pipeline, recent orders)
- [x] Order search (order ID / name / phone) + pagination on `/orders`
- [x] Full order editing (`/orders/[id]/edit`) — customer info, address, items, payment
- [x] Cancellation/return now requires and stores a reason
- [x] Internal order notes actually persist (`InternalNoteEditor` + `/api/orders/[id]/note`)
- [ ] **Bulk multi-select actions** on the orders list — bulk status update, bulk label printing
- [ ] **Bulk & Festival Orders is still mock data** — needs a real `BulkOrder` model + create/edit form (`orders/bulk/page.js` currently renders a hardcoded array)

## Phase 2 — Inventory — mostly done
- [x] Auto-decrement stock when an order is placed; restock on cancel/return
- [x] Stock reconciled when an existing order's item quantities are edited
- [x] Stock movement log (`StockMovement` model + history panel on product edit page) — records order-placed/edited/cancelled/returned and manual product-stock edits
- [x] Orders now link items to real `Product` records via a picker (new + edit order forms), instead of pure freeform text — this is what makes auto stock tracking possible
- [x] Low-stock alerting: "Copy WhatsApp Alert" button on the Reports page's Low Stock card
- [ ] Product variants (different weights/sizes with their own price + stock) — deferred, needs a schema redesign of its own
- [ ] Bulk stock adjustment / CSV import for restocking day — deferred

Note: items added via the "Custom item" option (not linked to a real product) are
intentionally not stock-tracked — there's nothing in inventory to decrement.

## Phase 3 — Invoicing & documents
- [ ] Sequential, invoice-specific numbering (separate from order ID)
- [ ] Pull business details (address, FSSAI/GST) from Settings into invoice/label templates instead of hardcoded placeholder text
- [ ] Persist an invoice record per order (audit trail / reprint history)
- [ ] Real scannable barcode on shipping labels

## Phase 4 — Customers (CRM)
- [ ] Customer profile editing independent of orders (tags like VIP / do-not-COD)
- [ ] Wire the "Export CSV" button
- [ ] Duplicate-customer merge

## Phase 5 — Shipping & logistics
- [ ] Turn on real ShipRocket integration (scaffolded in `src/lib/shiprocket.js`)
- [ ] Webhook/polling to auto-update status from courier tracking
- [ ] Wire "Print All Labels" and "Schedule Pickup" buttons

## Phase 6 — Finance
- [ ] Persist expenses in a real `Expense` model (currently hardcoded table)
- [ ] Profit & loss view (revenue − expenses)
- [ ] COD reconciliation (mark courier remittances)
- [ ] Wire "Generate Tax Report" and export buttons

## Phase 7 — Marketing
- [ ] Turn on real WhatsApp sending (scaffolded in `src/lib/whatsapp.js`)
- [ ] Make recipient segment buttons (VIP/New/COD) query real customer data
- [ ] Persist coupons if there's an actual redemption flow to attach them to
- [ ] Log sent broadcasts

## Phase 8 — Reports
- [ ] Wire the date-range selector
- [ ] Wire CSV/PDF export
- [ ] Revenue-over-time trend

## Phase 9 — Settings
- [ ] Persist Settings (business profile, integration credentials, printer prefs) to the database
- [ ] Feed persisted settings into invoices/labels/integrations instead of `.env.local` only

## Phase 10 — Security & multi-user
- [ ] Real `User` model with roles, if more than one person will use this
- [ ] Fix/remove the misleading "constant-time compare" comment on login
- [ ] Basic rate-limiting on `/login` and write API routes

## Phase 11 — Ops
- [ ] MongoDB backups
- [ ] Error monitoring (Sentry or similar)
- [ ] Smoke tests around order creation and status transitions

---
*Last updated: 2026-09-07 (Phase 2 pass)*
