'use client';
import { createElement } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';

export function CartNavBadge({ className, children }: { className?: string; children?: React.ReactNode }) {
  const { items } = useCart();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return createElement(
    Link,
    { href: '/cart', className },
    children,
    count > 0 && createElement(
      'span',
      { className: 'ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-accent-primary text-canvas rounded-full' },
      count > 99 ? '99+' : count
    )
  );
}
