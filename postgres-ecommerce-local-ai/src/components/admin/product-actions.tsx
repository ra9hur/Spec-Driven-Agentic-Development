'use client';
import { createElement, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function AdminProductActions({ productId }: { productId: number }) {
  const router = useRouter();

  const handleDelete = useCallback(async () => {
    if (!confirm('Delete this product?')) return;
    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
      if (res.ok) router.refresh();
    } catch {}
  }, [productId, router]);

  return createElement(
    'div',
    { className: 'flex gap-2' },
    createElement(
      Link,
      { href: `/admin/products/${productId}`, className: 'text-accent-primary hover:underline text-sm' },
      'Edit'
    ),
    createElement(
      'button',
      { onClick: handleDelete, className: 'text-red-500 hover:underline text-sm' },
      'Delete'
    )
  );
}
