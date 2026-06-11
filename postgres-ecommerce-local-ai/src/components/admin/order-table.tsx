'use client';
import { createElement, useCallback, useState } from 'react';
import { StatusBadge } from './status-badge';

export interface Order {
  id: number;
  orderId: string;
  customer: string;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['pending', 'confirmed', 'cancelled'],
  confirmed: ['confirmed', 'shipped', 'cancelled'],
  shipped: ['shipped', 'delivered', 'cancelled'],
  delivered: ['delivered'],
  cancelled: ['cancelled'],
};

export function OrderTable({
  orders,
  onStatusUpdate: _externalHandler,
}: {
  orders: Order[];
  onStatusUpdate?: ((orderId: number, newStatus: Order['status']) => void) | undefined;
}) {
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStatusUpdate = useCallback(async (orderId: number, newStatus: Order['status']) => {
    setUpdatingId(orderId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to update status');
      }
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  }, []);

  return createElement(
    'div',
    { className: 'overflow-x-auto' },
    error && createElement('div', { className: 'mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-500 text-sm' }, error),
    createElement(
      'table',
      { className: 'w-full text-left' },
      createElement(
        'thead',
        {},
        createElement(
          'tr',
          { className: 'border-b border-border' },
          createElement('th', { className: 'py-3 px-4 text-text/60 font-medium text-sm' }, 'Order ID'),
          createElement('th', { className: 'py-3 px-4 text-text/60 font-medium text-sm' }, 'Customer'),
          createElement('th', { className: 'py-3 px-4 text-text/60 font-medium text-sm' }, 'Total'),
          createElement('th', { className: 'py-3 px-4 text-text/60 font-medium text-sm' }, 'Status'),
          createElement('th', { className: 'py-3 px-4 text-text/60 font-medium text-sm' }, 'Date'),
          createElement('th', { className: 'py-3 px-4 text-text/60 font-medium text-sm' }, 'Actions'),
        )
      ),
      createElement(
        'tbody',
        {},
        orders.length === 0
          ? createElement(
              'tr',
              {},
              createElement('td', { colSpan: 6, className: 'py-8 text-center text-text/60' }, 'No orders found')
            )
          : orders.map((order) => {
              const allowedStatuses = VALID_TRANSITIONS[order.status] || [order.status];
              return createElement(
                'tr',
                { key: order.id, className: 'border-b border-border hover:bg-container/50' },
                createElement('td', { className: 'py-3 px-4 text-text font-mono text-sm' }, order.orderId),
                createElement('td', { className: 'py-3 px-4 text-text' }, order.customer),
                createElement('td', { className: 'py-3 px-4 text-text' }, `$${order.total.toFixed(2)}`),
                createElement('td', { className: 'py-3 px-4' }, createElement(StatusBadge, { status: order.status })),
                createElement('td', { className: 'py-3 px-4 text-text/60 text-sm' }, order.date),
                createElement(
                  'td',
                  { className: 'py-3 px-4' },
                  createElement(
                    'select',
                    {
                      value: order.status,
                      disabled: updatingId === order.id,
                      onChange: (e: React.ChangeEvent<HTMLSelectElement>) => handleStatusUpdate(order.id, e.target.value as Order['status']),
                      className: 'bg-canvas border border-border rounded px-2 py-1 text-text text-sm focus:outline-none focus:border-accent-primary disabled:opacity-50',
                    },
                    allowedStatuses.map((s: string) =>
                      createElement('option', { key: s, value: s }, s.charAt(0).toUpperCase() + s.slice(1))
                    )
                  )
                )
              );
            })
      )
    )
  );
}
