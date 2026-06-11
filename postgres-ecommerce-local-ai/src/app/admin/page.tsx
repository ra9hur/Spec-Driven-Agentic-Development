import { createElement } from 'react';
import Link from 'next/link';
import pool from '@/lib/db';
import { getServerSession } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import { StatsCard } from '@/components/admin/stats-card';

export default async function AdminPage() {
  const session = await getServerSession();
  if (!session) redirect('/auth/login');

  const isAdmin = await pool.query(
    `SELECT public.has_role('admin'::public.user_role_enum, $1) AS is_admin`,
    [session.user.id]
  );
  if (!isAdmin.rows[0]?.is_admin) redirect('/auth/login');

  const totalOrdersResult = await pool.query('SELECT COUNT(*)::int AS count FROM public.orders');
  const revenueResult = await pool.query(
    "SELECT COALESCE(SUM(total), 0)::numeric(10,2) AS total FROM public.orders WHERE status != 'cancelled'"
  );
  const pendingResult = await pool.query(
    "SELECT COUNT(*)::int AS count FROM public.orders WHERE status = 'pending'"
  );

  const totalOrders = totalOrdersResult.rows[0].count;
  const revenue = revenueResult.rows[0].total;
  const pendingShipments = pendingResult.rows[0].count;

  return createElement(
    'div',
    { className: 'p-6 space-y-8' },
    createElement('h1', { className: 'text-3xl font-bold text-text' }, 'Dashboard'),
    createElement(
      'div',
      { className: 'grid grid-cols-1 md:grid-cols-3 gap-4' },
      createElement(StatsCard, { label: 'Total Orders', value: totalOrders, trend: 'up' }),
      createElement(StatsCard, { label: 'Revenue', value: `$${parseFloat(revenue).toLocaleString()}`, trend: 'up' }),
      createElement(StatsCard, { label: 'Pending Shipments', value: pendingShipments, trend: pendingShipments > 0 ? 'neutral' : 'up' })
    ),
    createElement(
      'div',
      { className: 'grid md:grid-cols-2 gap-6' },
      createElement(Link, { href: '/admin/products', className: 'bg-container border border-border rounded-lg p-6 hover:border-accent-primary/50 transition-colors' },
        createElement('h3', { className: 'text-lg font-bold text-text' }, 'Products'),
        createElement('p', { className: 'text-text/60 text-sm mt-1' }, 'Manage inventory and variants')
      ),
      createElement(Link, { href: '/admin/orders', className: 'bg-container border border-border rounded-lg p-6 hover:border-accent-primary/50 transition-colors' },
        createElement('h3', { className: 'text-lg font-bold text-text' }, 'Orders'),
        createElement('p', { className: 'text-text/60 text-sm mt-1' }, 'View and update order statuses')
      ),
      createElement(Link, { href: '/admin/users', className: 'bg-container border border-border rounded-lg p-6 hover:border-accent-primary/50 transition-colors' },
        createElement('h3', { className: 'text-lg font-bold text-text' }, 'Users'),
        createElement('p', { className: 'text-text/60 text-sm mt-1' }, 'Manage user roles and access')
      ),
      createElement(Link, { href: '/admin/settings', className: 'bg-container border border-border rounded-lg p-6 hover:border-accent-primary/50 transition-colors' },
        createElement('h3', { className: 'text-lg font-bold text-text' }, 'Settings'),
        createElement('p', { className: 'text-text/60 text-sm mt-1' }, 'System configuration')
      )
    )
  );
}
