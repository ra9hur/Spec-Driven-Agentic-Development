import { createElement } from 'react';
import { useCart } from '@/hooks/use-cart';
import { formatCurrency } from '@/lib/utils/format';
import { Button } from '@/components/shared/button';
import Link from 'next/link';

export function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();

  if (!isOpen) return null;

  return createElement(
    'div',
    { className: 'fixed inset-0 z-50' },
    createElement('div', {
      className: 'fixed inset-0 bg-black opacity-50',
      onClick: onClose,
    }),
    createElement(
      'div',
      { 'data-testid': 'cart-drawer', className: 'absolute bottom-0 md:top-0 md:right-0 w-full md:w-96 max-h-screen bg-container flex flex-col' },
      createElement(
        'div',
        { className: 'flex items-center justify-between p-4 border-b border-border' },
        createElement('h2', { className: 'text-xl font-bold text-text' }, 'Cart'),
        createElement('button', { onClick: onClose, className: 'text-text/60 hover:text-text' }, '×')
      ),
      createElement(
        'div',
        { className: 'flex-1 overflow-y-auto p-4 space-y-4' },
        items.length === 0
          ? createElement('p', { className: 'text-text/60 text-center py-8' }, 'Your cart is empty')
          : createElement(
              'div',
              { className: 'space-y-4' },
              items.map((item) => createElement(
                CartItem,
                { key: item.variantId, item, onRemove: removeItem, onUpdate: updateQuantity }
              ))
            )
      ),
      items.length > 0 && createElement(
        'div',
        { className: 'p-4 border-t border-border space-y-4' },
        createElement(
          'div',
          { className: 'flex justify-between text-text' },
          createElement('span', {}, 'Total'),
          createElement('span', { className: 'font-bold text-accent-primary' }, formatCurrency(total))
        ),
        createElement(Link, { href: '/checkout', onClick: onClose }, createElement(Button, { className: 'w-full' }, 'Checkout')),
      )
    )
  );
}

function CartItem({ item, onRemove, onUpdate }: { item: any; onRemove: (id: number) => void; onUpdate: (id: number, qty: number) => void }) {
  return createElement(
    'div',
    { className: 'flex gap-4 p-3 bg-canvas rounded' },
      createElement(
        'div',
        { className: 'w-16 h-16 bg-canvas rounded flex-shrink-0 overflow-hidden' },
        item.imageUrl && createElement('img', {
          src: item.imageUrl,
          alt: item.name,
          className: 'w-full h-full object-cover',
        })
      ),
    createElement(
      'div',
      { className: 'flex-1 min-w-0' },
      createElement('h4', { className: 'text-text font-medium truncate' }, item.name),
      createElement('p', { className: 'text-text/60 text-sm' }, `${item.size || ''} ${item.color || ''}`),
      createElement('p', { className: 'text-accent-primary font-medium' }, formatCurrency(item.price)),
      createElement(
        'div',
        { className: 'flex items-center gap-2 mt-2' },
        createElement('button', {
          onClick: () => onUpdate(item.variantId, item.quantity - 1),
          className: 'w-8 h-8 border border-border rounded text-text hover:bg-border',
        }, '−'),
        createElement('span', { className: 'w-8 text-center text-text' }, item.quantity),
        createElement('button', {
          onClick: () => onUpdate(item.variantId, item.quantity + 1),
          className: 'w-8 h-8 border border-border rounded text-text hover:bg-border',
        }, '+'),
        createElement('button', {
          onClick: () => onRemove(item.variantId),
          className: 'ml-auto text-text/50 hover:text-text text-sm',
        }, 'Remove')
      )
    )
  );
}
