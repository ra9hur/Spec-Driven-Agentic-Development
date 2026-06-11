import { createElement } from 'react';

export default function AdminOrderDetailPage({ params }: { params: { ['order-id']: string } }) {
  return createElement(
    'div',
    { className: 'p-6 space-y-6' },
    createElement('h1', { className: 'text-3xl font-bold text-text' }, `Order #${params['order-id']}`),
    createElement('p', { className: 'text-text/60' }, 'Order details and status management coming soon.')
  );
}
