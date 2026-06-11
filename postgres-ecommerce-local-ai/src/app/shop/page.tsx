import { createElement } from 'react';
import Link from 'next/link';
import pool from '@/lib/db';

export default async function ShopPage() {
  const result = await pool.query(
    `SELECT c.slug, c.name, COUNT(p.id)::int as count
     FROM categories c
     LEFT JOIN products p ON p.category_id = c.id
     GROUP BY c.id, c.slug, c.name
     ORDER BY c.id`
  );

  const categories = result.rows;

  return createElement(
    'div',
    { className: 'max-w-7xl mx-auto p-6 space-y-8' },
    createElement('h1', { className: 'text-3xl font-bold text-text' }, 'Shop'),
    createElement(
      'div',
      { className: 'grid grid-cols-2 md:grid-cols-4 gap-6', 'data-testid': 'product-grid' },
      categories.map((cat: any) =>
        createElement(
          Link,
          { key: cat.slug, href: `/shop/${cat.slug}` },
          createElement(
            'div',
            { className: 'bg-container border border-border rounded-lg p-8 text-center hover:border-accent-primary/50 transition-colors' },
            createElement('h3', { className: 'text-xl font-bold text-text mb-2' }, cat.name),
            createElement('p', { className: 'text-sm text-text/50' }, `${cat.count} products`)
          )
        )
      )
    )
  );
}
