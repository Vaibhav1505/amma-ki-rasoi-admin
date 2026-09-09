'use server';

import { redirect } from 'next/navigation';
import { timingSafeEqual } from 'node:crypto';
import { createSession, deleteSession } from '@/lib/session';

// Plain `===` on secrets leaks a few nanoseconds of timing signal per
// matching character, which is how the comment here used to (incorrectly)
// claim this was already constant-time. This actually is: pad both sides
// to the same length first (Buffer.compare would short-circuit and
// timingSafeEqual throws on a length mismatch) so a wrong-length guess
// takes the same time as a right-length one, then compare with
// timingSafeEqual so the comparison itself doesn't branch early either.
function safeStringEqual(a, b) {
  const aBuf = Buffer.from(String(a ?? ''));
  const bBuf = Buffer.from(String(b ?? ''));
  const len = Math.max(aBuf.length, bBuf.length, 1);
  const aPadded = Buffer.alloc(len);
  const bPadded = Buffer.alloc(len);
  aBuf.copy(aPadded);
  bBuf.copy(bPadded);
  // Still compare lengths explicitly — timingSafeEqual only guarantees
  // constant time for equal-length buffers, and padding alone would let a
  // shorter guess "match" the padding of a longer secret.
  return aBuf.length === bBuf.length && timingSafeEqual(aPadded, bPadded);
}

export async function login(prevState, formData) {
  const username = formData.get('username')?.toString().trim();
  const password = formData.get('password')?.toString();

  // Basic validation
  if (!username || !password) {
    return { error: 'Please enter both username and password.' };
  }

  // Compare against env credentials (constant-time compare to prevent timing attacks)
  const validUsername = process.env.ADMIN_USERNAME;
  const validPassword = process.env.ADMIN_PASSWORD;

  const usernameMatch = safeStringEqual(username, validUsername);
  const passwordMatch = safeStringEqual(password, validPassword);

  if (!usernameMatch || !passwordMatch) {
    return { error: 'Invalid username or password.' };
  }

  // Create session cookie
  await createSession(username);

  // Redirect into the dashboard
  redirect('/');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}
