import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

// Routes that don't need auth
const PUBLIC_ROUTES = ['/login'];

// Requests allowed per client IP, per minute. Login is tighter (brute-force
// protection); API writes are looser (just a backstop against runaway
// scripts/bugs, not normal single-admin usage). See lib/rateLimit.js for
// caveats about this being in-memory/per-process.
const LOGIN_ATTEMPTS_PER_MINUTE = 8;
const API_WRITES_PER_MINUTE = 60;

export default async function proxy(req) {
  const path = req.nextUrl.pathname;
  const method = req.method;
  const ip = getClientIp(req);

  // Rate-limit login attempts. The login form posts to '/login' itself (a
  // React server action bound to the current URL), so this catches it.
  if (path === '/login' && method === 'POST') {
    const { allowed, retryAfterMs } = checkRateLimit(`${ip}:login`, LOGIN_ATTEMPTS_PER_MINUTE);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait a minute and try again.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
      );
    }
  }

  // Rate-limit mutating API calls (writes). Reads (GET/HEAD) are left alone
  // — this is a backstop against a runaway script or bug hammering the API,
  // not a throttle on normal browsing/reporting traffic. Auth for API
  // routes is still enforced per-route via requireAuth(); this proxy layer
  // used to skip /api entirely, so it's the only thing that changed here.
  if (path.startsWith('/api/') && method !== 'GET' && method !== 'HEAD') {
    const { allowed, retryAfterMs } = checkRateLimit(`${ip}:api-write`, API_WRITES_PER_MINUTE);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down and try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
      );
    }
  }

  // API routes handle their own auth (requireAuth() per-route, returning a
  // JSON 401) — nothing below this applies to them.
  if (path.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Allow public routes through
  const isPublic = PUBLIC_ROUTES.some(r => path.startsWith(r));

  // Read the session cookie
  const sessionToken = req.cookies.get('admin_session')?.value;
  const session = await decrypt(sessionToken);
  const isAuthed = !!session?.username;

  // Not logged in → trying to access a protected route → send to /login
  if (!isPublic && !isAuthed) {
    const loginUrl = new URL('/login', req.nextUrl);
    loginUrl.searchParams.set('from', path); // remember where they came from
    return NextResponse.redirect(loginUrl);
  }

  // Already logged in → trying to access /login → redirect to home
  if (isPublic && isAuthed) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  // Runs on every route except Next.js internals and static files. API
  // routes are now included too (for write-rate-limiting only — see the
  // early-return above); everything else keeps the original auth-gate
  // behavior.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
