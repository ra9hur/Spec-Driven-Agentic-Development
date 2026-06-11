import { validateEmail, validatePassword } from '@/lib/utils/validation';

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
}

export async function signUp(email: string, password: string, displayName?: string) {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, displayName }),
  });
  const data = await res.json();
  if (!res.ok) return { data: null, error: data };
  return { data, error: null };
}

export async function signIn(email: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) return { data: null, error: data };
  return { data, error: null };
}

export async function signOut() {
  const res = await fetch('/api/auth/logout', { method: 'POST' });
  return { error: res.ok ? null : { message: 'Logout failed' } };
}

export { validateEmail, validatePassword };
