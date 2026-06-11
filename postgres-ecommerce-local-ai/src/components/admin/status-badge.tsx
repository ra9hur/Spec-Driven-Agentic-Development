import { createElement } from 'react';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export const orderStatusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
  confirmed: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  shipped: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
  delivered: 'bg-accent-primary/10 text-accent-primary border-accent-primary/30',
  cancelled: 'bg-red-500/10 text-red-500 border-red-500/30',
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return createElement(
    'span',
    {
      className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${orderStatusColors[status]}`,
    },
    status.charAt(0).toUpperCase() + status.slice(1)
  );
}
