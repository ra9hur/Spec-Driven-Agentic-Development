import { createElement } from 'react';
import { useCart } from '@/hooks/use-cart';
import { formatCurrency } from '@/lib/utils/format';

export function OrderSummary() {
  const { total, items } = useCart();
  const subtotal = total;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + shipping + tax;

  return createElement(
    'div',
    { 'data-testid': 'order-summary', className: 'bg-container border border-border rounded-lg p-6' },
    createElement('h3', { className: 'text-lg font-bold text-text mb-4' }, 'Order Summary'),
    createElement(
      'div',
      { className: 'space-y-3 text-sm' },
      items.map((item) =>
        createElement(
          'div',
          { key: item.variantId, className: 'flex justify-between text-text' },
          createElement('span', { className: 'truncate max-w-[200px]' }, `${item.name} × ${item.quantity}`),
          createElement('span', {}, formatCurrency(item.price * item.quantity))
        )
      ),
      createElement('hr', { className: 'border-border' }),
      createElement('div', { className: 'flex justify-between text-text' }, createElement('span', {}, 'Subtotal'), createElement('span', {}, formatCurrency(subtotal))),
      createElement('div', { className: 'flex justify-between text-text' }, createElement('span', {}, 'Shipping'), createElement('span', {}, shipping === 0 ? 'Free' : formatCurrency(shipping))),
      createElement('div', { className: 'flex justify-between text-text' }, createElement('span', {}, 'Tax'), createElement('span', {}, formatCurrency(tax))),
      createElement('hr', { className: 'border-border' }),
      createElement('div', { className: 'flex justify-between text-lg font-bold text-text' }, createElement('span', {}, 'Total'), createElement('span', { className: 'text-accent-primary' }, formatCurrency(grandTotal))),
      createElement('div', { className: 'mt-4 p-3 bg-canvas rounded text-sm text-text/60' }, 'Payment: Cash on Delivery (COD)')
    )
  );
}
