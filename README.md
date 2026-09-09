# Amma Ki Rasoi — Admin Dashboard

## What this actually is

**Amma Ki Rasoi** ("घर के स्वाद की परंपरा" — the tradition of home flavours) is a home-based Indian food business selling pickles (achaar), badi, spices, snacks, and sweets, taking orders mostly over WhatsApp, phone, Instagram, and word of mouth.

This repository is **not** the customer-facing storefront — there isn't one yet. It's the **internal operations tool**: the single dashboard the owner (and eventually staff) uses to run the business day to day — enter orders as they come in from WhatsApp/phone, track each one from pending through packed, shipped, and delivered, keep inventory honest, print invoices and shipping labels, remember who customers are and what they've bought, and see revenue at a glance.

If you're picking this codebase up cold: it's a small-business back office, not a marketplace app. Every design decision (single admin login, orders entered manually rather than via checkout, WhatsApp-first messaging) follows from that.

## Core workflows that actually work today

**Orders** — create manually (with a product picker that ties line items to real inventory, or freeform "custom item" entries), edit before it ships, move through a status pipeline (`pending → confirmed → packing → shipped → delivered`, plus `cancelled`/`return`/`cod_pending` off-ramps that require a reason), search by name/phone/order ID, paginate, and leave internal staff notes on any order.

**Inventory** — stock auto-decrements when an order is placed and auto-restocks on cancel/return/edit, every change is logged to an audit trail (`StockMovement`), and low-stock items get a one-click "copy WhatsApp alert" message.

**Invoicing & shipping documents** — every printed invoice gets a stable, sequential invoice number (independent of the order ID) that survives reprints; both the invoice and the 4×6 shipping label pull real business details (name, address, GSTIN, FSSAI number) from Settings instead of hardcoded placeholder text; labels carry an actual scannable Code128 barcode of the order ID.

**Customers (CRM)** — customer profiles are derived from order history (name, spend, favourite products) plus a persisted layer for things orders can't hold: tags (VIP, No COD, Blocked, Wholesale, or custom) and internal notes. Differently-formatted duplicate phone numbers for the same person get flagged and can be merged (reassigns their orders, unions their tags). CSV export is real.

**Dashboard home** — today's order count/revenue, an overdue-shipment/low-stock/ready-to-pack "needs attention" queue, and a live order pipeline, all computed from the database rather than mocked.

**Finance & Reports** — revenue split by payment method, pending COD collections, top-selling products, low-stock alerts.

**Auth** — single admin identity (`ADMIN_USERNAME`/`ADMIN_PASSWORD` in `.env.local`), JWT session in an httpOnly cookie, route protection via `src/proxy.js` (Next 16 renamed `middleware.js` → `proxy.js` — see the note below if that looks unfamiliar).

## What's still a placeholder

- **ShipRocket and WhatsApp sending** are scaffolded (`src/lib/shiprocket.js`, `src/lib/whatsapp.js`) but not live — they need real API credentials and the commented-out `fetch` calls uncommented.
- **Bulk & Festival Orders**, the **Marketing** broadcast tool, and **Festival Planning** still show illustrative mock data rather than persisted records.
- **Settings**: the Business Profile section is real and persisted; ShipRocket/WhatsApp credential fields and printer preferences are still `.env.local`-only (intentionally disabled in the UI rather than pretending to save).

See **[ROADMAP.md](ROADMAP.md)** for the full phase-by-phase build tracker — what's done, what's next, and why.

## Tech stack

- **Next.js 16.2.10** (App Router, Turbopack). This version has real breaking changes from what most training data knows — e.g. `middleware.js` is deprecated in favor of `proxy.js`. When in doubt, check `node_modules/next/dist/docs/` before assuming old Next.js conventions still apply.
- **React 19**, **Mongoose 9** → **MongoDB**
- **jose** for JWT session cookies
- **bwip-js** for server-side barcode generation (no canvas/DOM dependency)
- Styling is mostly hand-rolled inline styles + `src/app/globals.css`; Tailwind v4 is installed but not the primary styling approach.

## Data model

| Model | Purpose |
|---|---|
| `Order` | The core record — customer, items, status, payment, shipping info |
| `Product` | Catalog entry with price, weight, category, stock |
| `Customer` | CRM overlay keyed by phone — tags + internal notes only (everything else is derived from `Order`) |
| `Invoice` | Sequential invoice numbers, one per order, stable across reprints |
| `StockMovement` | Audit log of every stock change and why it happened |
| `BusinessSettings` | Singleton — the business profile shown on invoices/labels |
| `Counter` | Atomic sequence generator backing order IDs and invoice numbers |

## Getting started

1. **Install dependencies**: `npm install`
2. **Set up `.env.local`** — copy `.env.local.example` and fill it in. See **[ENV_VARS.md](ENV_VARS.md)** for what every variable does, which app(s) need it, and how to generate real values (also see the top of `src/lib/mongodb.js`, `src/lib/session.js`, and `src/app/actions/auth.js`):
   ```
   MONGODB_URI=mongodb://localhost:27017/amma_ki_rasoi   # or an Atlas connection string
   SESSION_SECRET=<random string — node -e "console.log(require('crypto').randomBytes(32).toString('base64'))">
   ADMIN_USERNAME=<pick one>
   ADMIN_PASSWORD=<pick a strong one>
   ```
   ShipRocket/WhatsApp variables are optional — the app runs fine without them, those integrations just stay in placeholder mode.
3. **Have MongoDB running** — either a local `mongod` or an Atlas cluster reachable at the URI above.
4. **Run it**: `npm run dev`, then log in at `/login`.
5. (Optional) `node seedOrders.mjs` seeds a few sample orders if you want data to look at immediately.

## Project structure at a glance

```
src/
  app/
    (dashboard)/        Home, Products, Customers, Finance, Reports, Settings, Festivals, Marketing
    orders/              Order list/create/edit/detail
    shipping/, print/    Logistics view; invoice & label print pages
    login/               Auth screen
    api/                 REST-ish route handlers (orders, products, customers, settings)
    actions/             Server Actions (login/logout)
  components/            Client components (status updates, forms, CRM editors)
  lib/
    models/              Mongoose schemas
    *.js                 Shared server-side logic (auth, inventory, invoicing, barcode, settings)
  proxy.js               Auth gate for every non-API, non-static route
```
