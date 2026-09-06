import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';

// Routes that don't need auth
const PUBLIC_ROUTES = ['/login'];

export default async function proxy(req) {
  const path = req.nextUrl.pathname;

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
  // Run on every route except Next.js internals, static files and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
