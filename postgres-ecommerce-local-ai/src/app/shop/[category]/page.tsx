import { createElement } from 'react';
import { notFound } from 'next/navigation';
import pool from '@/lib/db';
import { ProductCard } from '@/components/products/product-card';
import { CategorySortSelect } from '@/components/products/category-sort-select';
import { PriceRangeFilter } from '@/components/products/price-range-filter';

function getOrderBy(sort: string | null): string {
  switch (sort) {
    case 'price-asc': return 'p.price ASC';
    case 'price-desc': return 'p.price DESC';
    case 'name-asc': return 'p.name ASC';
    default: return 'p.id';
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { category: string };
  searchParams: { sort?: string; maxPrice?: string };
}) {
  const catResult = await pool.query('SELECT slug FROM categories');
  const validSlugs = catResult.rows.map((r: any) => r.slug);
  if (!validSlugs.includes(params.category)) {
    notFound();
  }

  const orderBy = getOrderBy(searchParams.sort || null);
  const maxPrice = searchParams.maxPrice || null;

  const maxResult = await pool.query(
    `SELECT COALESCE(MAX(p.price), 0) as max_price
     FROM products p
     JOIN categories c ON c.id = p.category_id
     WHERE c.slug = $1`,
    [params.category]
  );
  const dbMaxPrice = parseFloat(maxResult.rows[0].max_price);

  const result = await pool.query(
    `SELECT p.id, p.name, p.price, p.image_url, c.name as category_name
     FROM products p
     JOIN categories c ON c.id = p.category_id
     WHERE c.slug = $1${maxPrice ? ' AND p.price <= $2' : ''}
     ORDER BY ${orderBy}`,
    maxPrice ? [params.category, maxPrice] : [params.category]
  );

  const products = result.rows;

  return createElement(
    'div',
    { className: 'max-w-7xl mx-auto p-6 space-y-6' },
    createElement('h1', { className: 'text-3xl font-bold text-text capitalize' }, params.category.replace('-', ' ')),
    createElement(
      'div',
      { className: 'flex gap-4 flex-wrap items-center' },
      createElement(CategorySortSelect),
      createElement(PriceRangeFilter, { max: Math.ceil(dbMaxPrice) })
    ),
    createElement(
      'div',
      { className: 'grid grid-cols-2 md:grid-cols-4 gap-4', 'data-testid': 'product-grid' },
      products.length > 0
        ? products.map((product: any) =>
            createElement(ProductCard, {
              key: product.id,
              id: product.id,
              name: product.name,
              price: parseFloat(product.price),
              imageUrl: product.image_url || undefined,
              category: product.category_name,
            })
          )
        : createElement('p', { className: 'col-span-full text-center text-text/50 py-12' }, 'No products found in this category.')
    )
  );
}
