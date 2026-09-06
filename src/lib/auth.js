import 'server-only';
import { cookies } from 'next/headers';
import { decrypt } from './session';
import { NextResponse } from 'next/server';

/**
 * Call this at the top of any API route handler to ensure the request
 * comes from an authenticated admin session.
 *
 * Usage:
 *   const authError = await requireAuth();
 *   if (authError) return authError;
 */
export async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  const session = await decrypt(token);

  if (!session?.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null; // null = auth passed
}
