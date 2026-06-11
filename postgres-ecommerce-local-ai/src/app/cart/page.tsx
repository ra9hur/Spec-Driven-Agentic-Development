'use client';
import { createElement } from 'react';
import { useCart } from '@/hooks/use-cart';
import { formatCurrency } from '@/lib/utils/format';
import { Button } from '@/components/shared/button';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();

  return createElement(
    'div',
    { 'data-testid': 'cart-page', className: 'max-w-2xl mx-auto p-6 space-y-6' },
    createElement('h1', { className: 'text-3xl font-bold text-text' }, 'Cart'),
    items.length === 0
      ? createElement(
          'div',
          { className: 'text-center py-16 space-y-4' },
          createElement('p', { className: 'text-text/60 text-lg' }, 'Your cart is empty'),
          createElement(
            Link,
            { href: '/shop', className: 'text-accent-primary hover:underline inline-block' },
            'Continue Shopping'
          )
        )
      : createElement(
          'div',
          { className: 'space-y-4' },
          items.map((item) =>
            createElement(
              'div',
              { key: item.variantId, className: 'flex items-center gap-4 bg-container border border-border rounded p-4' },
              createElement(
                'div',
                { className: 'w-20 h-20 bg-canvas rounded flex-shrink-0 overflow-hidden' },
                item.imageUrl && createElement('img', {
                  src: item.imageUrl,
                  alt: item.name,
                  className: 'w-full h-full object-cover',
                })
              ),
              createElement(
                'div',
                { className: 'flex-1 min-w-0' },
                createElement('h3', { className: 'text-text font-medium truncate' }, item.name),
                createElement('p', { className: 'text-text/60 text-sm' }, `${item.size || ''} ${item.color || ''}`),
                createElement('p', { className: 'text-accent-primary font-medium mt-1' }, formatCurrency(item.price))
              ),
              createElement(
                'div',
                { className: 'flex items-center gap-2' },
                createElement('button', {
                  onClick: () => updateQuantity(item.variantId, item.quantity - 1),
                  className: 'w-8 h-8 border border-border rounded text-text hover:bg-border',
                }, '−'),
                createElement('span', { className: 'w-8 text-center text-text' }, item.quantity),
                createElement('button', {
                  onClick: () => updateQuantity(item.variantId, item.quantity + 1),
                  className: 'w-8 h-8 border border-border rounded text-text hover:bg-border',
                }, '+'),
                createElement('button', {
                  onClick: () => removeItem(item.variantId),
                  className: 'ml-2 text-text/50 hover:text-text text-sm',
                }, 'Remove')
              )
            )
          ),
          createElement(
            'div',
            { className: 'flex justify-between items-center pt-4 border-t border-border' },
            createElement('span', { className: 'text-lg font-bold text-text' }, 'Total'),
            createElement('span', { className: 'text-xl font-bold text-accent-primary' }, formatCurrency(total))
          ),
          createElement(
            'div',
            { className: 'flex gap-4' },
            createElement(Link, { href: '/checkout', className: 'flex-1' }, createElement(Button, { className: 'w-full' }, 'Checkout')),
            createElement(Link, { href: '/shop', className: 'flex-1' }, createElement(Button, { className: 'w-full bg-border text-text hover:bg-text/20' }, 'Continue Shopping'))
          )
        )
  );
}
