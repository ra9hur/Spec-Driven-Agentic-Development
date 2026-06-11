import { createElement } from 'react';
import Link from 'next/link';

export default function AccountPage() {
  return createElement(
    'div',
    { className: 'max-w-4xl mx-auto p-6 space-y-8' },
    createElement('h1', { className: 'text-3xl font-bold text-text' }, 'My Account'),
    createElement(
      'div',
      { className: 'grid md:grid-cols-2 gap-6' },
      createElement(Link, { href: '/account/orders', className: 'bg-container border border-border rounded-lg p-6 hover:border-accent-primary/50 transition-colors' },
        createElement('h3', { className: 'text-lg font-bold text-text' }, 'My Orders'),
        createElement('p', { className: 'text-text/60 text-sm mt-1' }, 'View your order history and track deliveries')
      ),
      createElement('div', { className: 'bg-container border border-border rounded-lg p-6' },
        createElement('h3', { className: 'text-lg font-bold text-text' }, 'Profile Settings'),
        createElement('p', { className: 'text-text/60 text-sm mt-1' }, 'Manage your personal information')
      )
    )
  );
}
