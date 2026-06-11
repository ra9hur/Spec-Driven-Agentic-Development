import { createElement } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import pool from '@/lib/db';
import { getServerSession } from '@/lib/auth-server';
import { SidebarToggle } from '@/components/admin/sidebar-toggle';

const NAV_LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/settings', label: 'Settings' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) {
    redirect('/auth/login');
  }

  const result = await pool.query(
    `SELECT public.has_role('admin'::public.user_role_enum, $1) AS is_admin`,
    [session.user.id]
  );

  if (!result.rows[0]?.is_admin) {
    redirect('/auth/login');
  }

  return createElement(
    'div',
    { className: 'flex min-h-screen' },
    createElement(SidebarToggle, { navLinks: NAV_LINKS }),
    createElement(
      'aside',
      { className: 'fixed left-0 top-0 h-full w-56 bg-container border-r border-border p-4 hidden lg:block' },
      createElement(
        'div',
        { className: 'mb-8' },
        createElement('div', { className: 'text-xs font-mono text-accent-primary bg-accent-primary/10 inline-block px-2 py-1 rounded mb-4' }, 'ADMIN ACCESS - VERIFIED'),
        createElement(Link, { href: '/admin', className: 'block text-text font-bold text-lg' }, 'Admin Panel')
      ),
      createElement(
        'nav',
        { className: 'space-y-1' },
        NAV_LINKS.map((link) =>
          createElement(
            Link,
            { key: link.href, href: link.href, className: 'block px-3 py-2 text-sm text-text/80 hover:text-text hover:bg-canvas rounded transition-colors' },
            link.label
          )
        ),
        createElement('hr', { className: 'my-4 border-border' }),
        createElement(Link, { href: '/', className: 'block px-3 py-2 text-sm text-text/80 hover:text-text hover:bg-canvas rounded transition-colors' }, '← Back to Store')
      )
    ),
    createElement(
      'main',
      { className: 'flex-1 lg:ml-56 min-h-screen pt-14 lg:pt-0' },
      children
    )
  );
}
