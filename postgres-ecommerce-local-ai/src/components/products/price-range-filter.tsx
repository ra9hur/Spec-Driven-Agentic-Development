'use client';
import { createElement } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function PriceRangeFilter({ max }: { max: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentValue = searchParams.get('maxPrice') || String(max);

  return createElement(
    'div',
    { className: 'flex items-center gap-2 text-sm text-text/60' },
    createElement('label', { htmlFor: 'price-range' }, 'Max Price:'),
    createElement('span', { className: 'font-mono text-accent-primary min-w-[4rem]' }, `$${currentValue}`),
    createElement('input', {
      id: 'price-range',
      type: 'range',
      min: 0,
      max,
      value: currentValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const params = new URLSearchParams(searchParams.toString());
        if (value === String(max)) {
          params.delete('maxPrice');
        } else {
          params.set('maxPrice', value);
        }
        const qs = params.toString();
        router.push(qs ? `?${qs}` : window.location.pathname);
      },
      className: 'accent-accent-primary w-24',
    })
  );
}
