import { createElement } from 'react';

interface FilterBarProps {
  sortValue?: string;
  priceValue?: number;
  onSortChange?: (value: string) => void;
  onPriceChange?: (value: number) => void;
}

export function FilterBar({ sortValue, priceValue, onSortChange, onPriceChange }: FilterBarProps) {
  return createElement(
    'div',
    { className: 'flex gap-4 flex-wrap items-center' },
    createElement(
      'select',
      {
        value: sortValue || 'default',
        onChange: onSortChange ? (e: React.ChangeEvent<HTMLSelectElement>) => onSortChange(e.target.value) : undefined,
        className: 'bg-canvas border border-border rounded px-3 py-2 text-text text-sm focus:outline-none focus:border-accent-primary',
      },
      createElement('option', { value: 'default' }, 'Sort by: Default'),
      createElement('option', { value: 'price-asc' }, 'Price: Low to High'),
      createElement('option', { value: 'price-desc' }, 'Price: High to Low'),
      createElement('option', { value: 'name-asc' }, 'Name: A-Z')
    ),
    createElement('input', {
      type: 'range',
      min: 0,
      max: 200,
      value: priceValue ?? 100,
      onChange: onPriceChange ? (e: React.ChangeEvent<HTMLInputElement>) => onPriceChange(Number(e.target.value)) : undefined,
      className: 'accent-accent-primary w-32',
    }),
    priceValue !== undefined && createElement(
      'span',
      { className: 'text-text/60 text-sm' },
      `Up to $${priceValue}`
    )
  );
}
