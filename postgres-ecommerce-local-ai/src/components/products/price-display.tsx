import { createElement } from 'react';

export interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  className?: string;
}

export function PriceDisplay({ price, originalPrice, className = '' }: PriceDisplayProps) {
  return createElement(
    'div',
    { className: `flex items-center gap-2 ${className}` },
    createElement('span', { className: 'text-accent-primary font-semibold text-xl' }, `$${price.toFixed(2)}`),
    originalPrice && originalPrice > price && createElement(
      'span',
      { className: 'text-text/40 line-through text-sm' },
      `$${originalPrice.toFixed(2)}`
    )
  );
}
