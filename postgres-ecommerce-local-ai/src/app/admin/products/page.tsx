import { createElement } from 'react';
import Link from 'next/link';
import pool from '@/lib/db';
import { getServerSession } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import { AdminProductActions } from '@/components/admin/product-actions';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const session = await getServerSession();
  if (!session) redirect('/auth/login');

  const isAdmin = await pool.query(
    `SELECT public.has_role('admin'::public.user_role_enum, $1) AS is_admin`,
    [session.user.id]
  );
  if (!isAdmin.rows[0]?.is_admin) redirect('/auth/login');

  const products = await pool.query(
    `SELECT p.id, p.name, p.price, p.image_url, c.name AS category_name
     FROM public.products p LEFT JOIN public.categories c ON c.id = p.category_id
     ORDER BY p.id`
  );

  return createElement(
    'div',
    { className: 'p-6 space-y-6' },
    createElement(
      'div',
      { className: 'flex items-center justify-between' },
      createElement('h1', { className: 'text-3xl font-bold text-text' }, 'Products'),
      createElement(Link, { href: '/admin/products/create' }, createElement('button', { className: 'bg-accent-primary text-canvas px-4 py-2 rounded hover:bg-accent-primary/90 transition-colors' }, 'Add Product'))
    ),
    createElement(
      'div',
      { className: 'overflow-x-auto' },
      createElement(
        'table',
        { className: 'w-full text-left' },
        createElement('thead', {},
          createElement('tr', { className: 'border-b border-border' },
            createElement('th', { className: 'py-3 px-4 text-text/60 font-medium text-sm' }, 'Name'),
            createElement('th', { className: 'py-3 px-4 text-text/60 font-medium text-sm' }, 'Price'),
            createElement('th', { className: 'py-3 px-4 text-text/60 font-medium text-sm' }, 'Category'),
            createElement('th', { className: 'py-3 px-4 text-text/60 font-medium text-sm' }, 'Actions')
          )
        ),
        createElement('tbody', {},
          products.rows.length === 0
            ? createElement('tr', {},
                createElement('td', { colSpan: 4, className: 'py-8 text-center text-text/60' }, 'No products yet')
              )
            : products.rows.map((product: any) =>
                createElement(
                  'tr',
                  { key: product.id, className: 'border-b border-border hover:bg-container/50' },
                  createElement('td', { className: 'py-3 px-4 text-text' }, product.name),
                  createElement('td', { className: 'py-3 px-4 text-text' }, `$${parseFloat(product.price).toFixed(2)}`),
                  createElement('td', { className: 'py-3 px-4 text-text/60 text-sm' }, product.category_name || '-'),
                  createElement('td', { className: 'py-3 px-4' },
                    createElement(AdminProductActions, { productId: product.id })
                  )
                )
            )
        )
      )
    )
  );
}
