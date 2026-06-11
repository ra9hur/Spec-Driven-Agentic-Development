import { createElement } from 'react';
import { formatCurrency } from '@/lib/utils/format';

export interface CartItemProps {
  variantId: number;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  imageUrl?: string;
  onUpdate: (variantId: number, quantity: number) => void;
  onRemove: (variantId: number) => void;
}

export function CartItem({ variantId, name, price, quantity, size, color, imageUrl, onUpdate, onRemove }: CartItemProps) {
  return createElement(
    'div',
    { className: 'flex gap-4 p-4 bg-container border border-border rounded' },
    imageUrl && createElement('img', {
      src: imageUrl,
      alt: name,
      className: 'w-20 h-20 object-cover rounded',
    }),
    createElement(
      'div',
      { className: 'flex-1 min-w-0' },
      createElement('h4', { className: 'text-text font-medium' }, name),
      createElement('p', { className: 'text-text/60 text-sm' }, `${size || ''} ${color || ''}`),
      createElement('p', { className: 'text-accent-primary font-medium' }, formatCurrency(price)),
      createElement(
        'div',
        { className: 'flex items-center gap-2 mt-2' },
        createElement('button', {
          onClick: () => onUpdate(variantId, quantity - 1),
          className: 'w-8 h-8 border border-border rounded text-text hover:bg-canvas',
        }, '−'),
        createElement('span', { className: 'w-8 text-center text-text' }, quantity),
        createElement('button', {
          onClick: () => onUpdate(variantId, quantity + 1),
          className: 'w-8 h-8 border border-border rounded text-text hover:bg-canvas',
        }, '+'),
        createElement('button', {
          onClick: () => onRemove(variantId),
          className: 'ml-auto text-text/50 hover:text-text text-sm',
        }, 'Remove')
      )
    ),
    createElement(
      'div',
      { className: 'text-right' },
      createElement('p', { className: 'text-text font-medium' }, formatCurrency(price * quantity))
    )
  );
}
