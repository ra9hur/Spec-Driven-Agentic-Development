import { createElement } from 'react';
import Link from 'next/link';
import { Button } from '@/components/shared/button';

export interface ConfirmationProps {
  orderId: string;
  customerName: string;
  total: number;
}

export function Confirmation({ orderId, customerName, total }: ConfirmationProps) {
  return createElement(
    'div',
    { className: 'max-w-lg mx-auto text-center space-y-6 py-12' },
    createElement(
      'div',
      { className: 'w-16 h-16 bg-accent-primary/10 rounded-full flex items-center justify-center mx-auto' },
      createElement('span', { className: 'text-2xl text-accent-primary' }, '✓')
    ),
    createElement('h1', { className: 'text-3xl font-bold text-text' }, 'Order Confirmed!'),
    createElement('p', { className: 'text-text/60' }, `Thank you, ${customerName}!`),
    createElement(
      'div',
      { className: 'bg-container border border-border rounded-lg p-6 space-y-3' },
      createElement('p', { className: 'text-sm text-text/60' }, 'Your Order ID'),
      createElement('p', { className: 'text-2xl font-mono font-bold text-accent-primary tracking-wider' }, orderId),
      createElement('p', { className: 'text-sm text-text/60' }, `Total: $${total.toFixed(2)}`),
      createElement('p', { className: 'text-xs text-text/40' }, 'Payment: Cash on Delivery (COD)')
    ),
    createElement(
      'div',
      { className: 'space-y-3' },
      createElement(Link, { href: '/account/orders' }, createElement(Button, { variant: 'secondary' }, 'View My Orders')),
      createElement(Link, { href: '/shop' }, createElement(Button, { variant: 'ghost' }, 'Continue Shopping'))
    )
  );
}
