'use client';
import { createElement, useState, useCallback } from 'react';
import { useSearch } from '@/hooks/use-search';
import { formatCurrency } from '@/lib/utils/format';
import Link from 'next/link';

export default function SearchOverlay() {
  const [inputValue, setInputValue] = useState('');
  const { results, loading, error, search } = useSearch();

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) search(inputValue.trim());
  }, [inputValue, search]);

  return createElement(
    'div',
    { className: 'min-h-screen bg-canvas p-6' },
    createElement(
      'div',
      { className: 'max-w-3xl mx-auto' },
      createElement(
        'form',
        { onSubmit: handleSubmit, className: 'flex items-center gap-4 mb-8' },
        createElement('input', {
          type: 'text',
          value: inputValue,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value),
          placeholder: 'Search products... [Press ⌘K to ask AI]',
          autoFocus: true,
          className: 'flex-1 bg-container border border-border rounded-lg px-4 py-3 text-text text-lg placeholder-text/30 focus:outline-none focus:border-accent-primary',
        })
      ),
      loading && createElement('div', { className: 'text-center text-text/60 py-12' }, 'Searching...'),
      error && createElement('div', { className: 'text-center text-red-400 py-12' }, error),
      !loading && !error && results.length === 0 && !inputValue && createElement(
        'div',
        { className: 'text-center text-text/40 py-12' },
        'Ask AI-powered search anything. Example: "items for healthy habits"'
      ),
      !loading && !error && results.length === 0 && inputValue && createElement(
        'div',
        { className: 'text-center text-text/40 py-12' },
        'No products found for "',
        createElement('span', { className: 'text-text/60 font-semibold' }, inputValue),
        '". Try a different search term.'
      ),
      !loading && !error && results.length > 0 && createElement(
        'div',
        { className: 'space-y-4' },
        results.map((product: any) =>
          createElement(
            Link,
            { key: product.id, href: `/products/${product.id}`, className: 'block bg-container border border-border rounded-lg p-4 hover:border-accent-primary/50 transition-colors' },
            createElement('h3', { className: 'text-text font-semibold text-lg' }, product.name),
            createElement('p', { className: 'text-text/40 text-sm mt-1' }, product.description || ''),
            createElement('p', { className: 'text-accent-primary font-medium mt-2' }, formatCurrency(product.price))
          )
        )
      )
    )
  );
}
