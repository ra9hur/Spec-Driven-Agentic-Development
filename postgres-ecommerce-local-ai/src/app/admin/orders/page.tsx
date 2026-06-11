import { createElement } from 'react';
import pool from '@/lib/db';
import { getServerSession } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import { OrderTable, Order } from '@/components/admin/order-table';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const session = await getServerSession();
  if (!session) redirect('/auth/login');

  const isAdmin = await pool.query(
    `SELECT public.has_role('admin'::public.user_role_enum, $1) AS is_admin`,
    [session.user.id]
  );
  if (!isAdmin.rows[0]?.is_admin) redirect('/auth/login');

  const result = await pool.query(
    `SELECT id, total, status, shipping_name AS customer, created_at
     FROM public.orders ORDER BY created_at DESC`
  );

  const orders: Order[] = result.rows.map((row: any) => ({
    id: row.id,
    orderId: 'ORD-' + row.id.toString().padStart(8, '0'),
    customer: row.customer,
    total: parseFloat(row.total),
    status: row.status,
    date: new Date(row.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
  }));

  return createElement(
    'div',
    { className: 'p-6 space-y-6' },
    createElement('h1', { className: 'text-3xl font-bold text-text' }, 'Orders'),
    createElement(OrderTable, { orders, onStatusUpdate: undefined })
  );
}
