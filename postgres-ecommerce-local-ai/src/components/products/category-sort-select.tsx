'use client';
import { createElement } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function CategorySortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'default';

  return createElement(
    'select',
    {
      value: currentSort,
      onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'default') {
          params.delete('sort');
        } else {
          params.set('sort', value);
        }
        const qs = params.toString();
        router.push(qs ? `?${qs}` : window.location.pathname);
      },
      className: 'bg-canvas border border-border rounded px-3 py-2 text-text text-sm focus:outline-none focus:border-accent-primary',
    },
    createElement('option', { value: 'default' }, 'Sort by: Default'),
    createElement('option', { value: 'price-asc' }, 'Price: Low to High'),
    createElement('option', { value: 'price-desc' }, 'Price: High to Low'),
    createElement('option', { value: 'name-asc' }, 'Name: A-Z')
  );
}
