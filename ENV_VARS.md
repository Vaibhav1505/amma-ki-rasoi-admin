# Environment variables — shared reference

Amma Ki Rasoi runs as two separate Next.js apps (this admin dashboard, and
the `amma_ki_rasoi` storefront) sharing one MongoDB database. This file is
the single reference for every environment variable either app reads —
which app needs it, whether it's required, and how to get a real value.
It's kept byte-identical in both repos (same pattern as the shared schema
files under `src/lib/models/`); update both copies together.

For the copy-paste starting point, use each repo's own `.env.local.example`
— this file explains what those values mean and where they come from.

## Required by both apps

| Variable | Used by | What it is |
|---|---|---|
| `MONGODB_URI` | admin, storefront | Connection string to the shared MongoDB database. Both apps **must** point at the same database — that's how "an order placed on the storefront shows up in the admin" works. Local dev: `mongodb://localhost:27017/amma_ki_rasoi`. Production: an Atlas (or self-hosted) connection string. If you change this in one app's `.env.local`, change it in the other's too. |

## Required by the admin app only

| Variable | What it is |
|---|---|
| `SESSION_SECRET` | Signing key for the admin's JWT session cookie (see `src/lib/session.js`). Generate a real random value — never reuse the example placeholder: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`. Changing this value invalidates every existing admin session (forces re-login). |
| `ADMIN_USERNAME` | The single admin login username (see `src/app/actions/auth.js`). This app has exactly one admin identity — no user table. |
| `ADMIN_PASSWORD` | The single admin login password. Pick a strong one; it's compared directly against the login form input (constant-time compare, but still — don't reuse a password from elsewhere). |

## Optional — admin app, ShipRocket integration

Scaffolded but not live yet (backlog item: "Run ShipRocket against a live
account"). Without these, shipping stays in placeholder mode — the app runs
fine, `src/lib/shiprocket.js` just has nothing to authenticate with.

| Variable | What it is |
|---|---|
| `SHIPROCKET_EMAIL` | Login email for your ShipRocket account. |
| `SHIPROCKET_PASSWORD` | Login password for that account. |
| `SHIPROCKET_PICKUP_LOCATION` | The pickup location name as configured in your ShipRocket dashboard (defaults to `Primary` if unset). |

## Optional — admin app, WhatsApp sending

Scaffolded but not live yet (backlog item: "Turn on real WhatsApp
sending"). Without these, the Marketing broadcast tool and low-stock alerts
stay copy-paste-only (`src/lib/whatsapp.js` builds the message text but
can't send it).

| Variable | What it is |
|---|---|
| `WHATSAPP_PROVIDER` | Which WhatsApp Business API provider to use (e.g. `interakt`). Determines which request shape `lib/whatsapp.js` sends. |
| `WHATSAPP_API_KEY` | API key/token from that provider. |
| `WHATSAPP_PHONE_NUMBER_ID` | The WhatsApp Business phone number ID to send from. |

## Set automatically — not yours to configure

| Variable | Notes |
|---|---|
| `NODE_ENV` | Set by Next.js itself (`development` under `next dev`, `production` under `next build && next start`). Only referenced once, in `lib/session.js`, to decide whether the session cookie gets the `secure` flag. Don't set this manually in `.env.local`. |

## Adding a new one

When a change introduces a new `process.env.X` read: add it to the
relevant repo's `.env.local.example` (with a comment, and commented-out if
optional — see the existing file for the pattern), and add a row to this
file in both repos. A quick way to check nothing's missing:
`grep -rn "process\.env\." src/` in each repo.
