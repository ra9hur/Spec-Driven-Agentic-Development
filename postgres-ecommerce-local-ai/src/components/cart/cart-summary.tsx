import { createElement } from 'react';
import { useCart } from '@/hooks/use-cart';
import { formatCurrency } from '@/lib/utils/format';
import { Button } from '@/components/shared/button';

export function CartSummary({ onCheckout }: { onCheckout: () => void }) {
  const { items, total } = useCart();

  if (items.length === 0) {
    return createElement('p', { className: 'text-text/60 text-center py-8' }, 'Your cart is empty');
  }

  const subtotal = total;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + shipping + tax;

  return createElement(
    'div',
    { className: 'bg-container border border-border rounded-lg p-6 sticky top-24' },
    createElement('h3', { className: 'text-lg font-bold text-text mb-4' }, 'Order Summary'),
    createElement(
      'div',
      { className: 'space-y-2 text-sm' },
      createElement(
        'div',
        { className: 'flex justify-between text-text' },
        createElement('span', {}, 'Subtotal'),
        createElement('span', {}, formatCurrency(subtotal))
      ),
      createElement(
        'div',
        { className: 'flex justify-between text-text' },
        createElement('span', {}, 'Shipping'),
        createElement('span', {}, shipping === 0 ? 'Free' : formatCurrency(shipping))
      ),
      createElement(
        'div',
        { className: 'flex justify-between text-text' },
        createElement('span', {}, 'Tax (8%)'),
        createElement('span', {}, formatCurrency(tax))
      ),
      createElement('hr', { className: 'border-border' }),
      createElement(
        'div',
        { className: 'flex justify-between text-lg font-bold text-text' },
        createElement('span', {}, 'Total'),
        createElement('span', { className: 'text-accent-primary' }, formatCurrency(grandTotal))
      )
    ),
    createElement(Button, { onClick: onCheckout, className: 'w-full mt-4 py-3' }, 'Proceed to Checkout')
  );
}
