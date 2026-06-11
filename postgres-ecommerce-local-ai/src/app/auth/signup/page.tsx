'use client';

import { createElement, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/shared/button';
import { signUp, validateEmail, validatePassword } from '@/lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Display name is required'); return; }

    const emailError = validateEmail(email);
    if (emailError) { setError(emailError); return; }

    const passwordError = validatePassword(password);
    if (passwordError) { setError(passwordError); return; }

    setLoading(true);
    const { error: signUpError } = await signUp(email, password, name.trim());
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message || 'Registration failed');
      return;
    }

    router.push('/auth/login?registered=true');
  }, [name, email, password, router]);

  return createElement(
    'div',
    { className: 'min-h-screen flex items-center justify-center p-4' },
    createElement(
      'div',
      { className: 'w-full max-w-sm space-y-6' },
      createElement('h1', { className: 'text-2xl font-bold text-text text-center' }, 'Create Account'),
      error && createElement('div', { className: 'bg-red-500/10 border border-red-500 text-red-500 text-sm rounded px-3 py-2' }, error),
      createElement(
        'form',
        { onSubmit: handleSubmit, className: 'space-y-4' },
        createElement('div', {},
          createElement('label', { htmlFor: 'name', className: 'block text-sm font-medium text-text mb-1' }, 'Display Name'),
          createElement('input', {
            id: 'name', required: true, value: name,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value),
            className: 'w-full bg-canvas border border-border rounded px-3 py-2 text-text focus:outline-none focus:border-accent-primary'
          })
        ),
        createElement('div', {},
          createElement('label', { htmlFor: 'email', className: 'block text-sm font-medium text-text mb-1' }, 'Email'),
          createElement('input', {
            id: 'email', type: 'email', required: true, value: email,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
            className: 'w-full bg-canvas border border-border rounded px-3 py-2 text-text focus:outline-none focus:border-accent-primary'
          })
        ),
        createElement('div', {},
          createElement('label', { htmlFor: 'password', className: 'block text-sm font-medium text-text mb-1' }, 'Password'),
          createElement('input', {
            id: 'password', type: 'password', required: true, value: password,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
            className: 'w-full bg-canvas border border-border rounded px-3 py-2 text-text focus:outline-none focus:border-accent-primary'
          })
        ),
        createElement(Button, { type: 'submit', disabled: loading, className: 'w-full' }, loading ? 'Creating account...' : 'Create Account')
      ),
      createElement('p', { className: 'text-center text-text/60 text-sm' }, 'Already have an account? ', createElement(Link, { href: '/auth/login', className: 'text-accent-primary hover:underline' }, 'Sign In'))
    )
  );
}
