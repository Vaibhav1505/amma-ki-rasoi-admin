import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) throw new Error('SESSION_SECRET is not set in .env.local');
const encodedKey = new TextEncoder().encode(secretKey);

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ─── Encrypt ──────────────────────────────────────────────────
export async function encrypt(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

// ─── Decrypt ──────────────────────────────────────────────────
export async function decrypt(session) {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch {
    return null;
  }
}

// ─── Create Session ───────────────────────────────────────────
export async function createSession(username) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const token = await encrypt({ username, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

// ─── Delete Session (Logout) ──────────────────────────────────
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
}

// ─── Get Current Session ──────────────────────────────────────
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  return decrypt(token);
}

// ─── Verify Session (redirects if not authed) ─────────────────
export async function verifySession() {
  const session = await getSession();
  return session?.username ? session : null;
}
