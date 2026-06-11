import { createElement } from 'react';

export default function AccountOrdersPage() {
  return createElement(
    'div',
    { className: 'max-w-4xl mx-auto p-6 space-y-6' },
    createElement('h1', { className: 'text-3xl font-bold text-text' }, 'My Orders'),
    createElement('p', { className: 'text-text/60' }, 'No orders yet. Start shopping to see your orders here.')
  );
}
