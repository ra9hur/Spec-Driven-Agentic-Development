import { createElement } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/shared/card';

export interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  category?: string;
}

export function ProductCard({ id, name, price, imageUrl, category }: ProductCardProps) {
  return createElement(
    Link,
    { href: `/products/${id}` },
    createElement(
      Card,
      { className: 'group hover:border-accent-primary/50 transition-colors' },
      createElement(
        'div',
        { className: 'aspect-square bg-canvas relative overflow-hidden' },
        imageUrl && createElement('img', {
          src: imageUrl,
          alt: name,
          className: 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-300',
        })
      ),
      createElement(
        CardContent,
        {},
        category && createElement('span', { className: 'text-xs text-text/50 uppercase tracking-wide' }, category),
        createElement('h3', { className: 'text-text font-medium mt-1' }, name),
        createElement('p', { className: 'text-accent-primary font-semibold mt-1' }, `$${price.toFixed(2)}`)
      )
    )
  );
}
