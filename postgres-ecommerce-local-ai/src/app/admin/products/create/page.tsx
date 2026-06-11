'use client';
import { createElement, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductForm, ProductFormData } from '@/components/admin/product-form';

export default function CreateProductPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: ProductFormData) => {
    setError(null);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to create product');
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    }
  };

  return createElement(
    'div',
    { className: 'p-6 space-y-6' },
    createElement('h1', { className: 'text-3xl font-bold text-text' }, 'Create Product'),
    error && createElement('div', { className: 'p-3 bg-red-500/10 border border-red-500/30 rounded text-red-500 text-sm' }, error),
    createElement(ProductForm, { onSubmit: handleSubmit, onCancel: () => router.push('/admin/products') })
  );
}
