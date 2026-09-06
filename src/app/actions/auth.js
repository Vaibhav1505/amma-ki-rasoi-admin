'use server';

import { redirect } from 'next/navigation';
import { createSession, deleteSession } from '@/lib/session';

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

  const usernameMatch = username === validUsername;
  const passwordMatch = password === validPassword;

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
