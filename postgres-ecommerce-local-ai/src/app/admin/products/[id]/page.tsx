'use client';
import { createElement, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductForm, ProductFormData, VariantInput } from '@/components/admin/product-form';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [initialData, setInitialData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/products/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setInitialData({
          name: data.name,
          description: data.description,
          price: data.price,
          categoryId: data.category_id,
          imageUrl: data.image_url || '',
          variants: (data.variants || []).map((v: any) => ({
            size: v.size,
            color: v.color,
            stock: v.stock,
          })),
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSubmit = async (data: ProductFormData) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to update product');
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
    }
  };

  if (loading) {
    return createElement('div', { className: 'p-6' }, createElement('p', { className: 'text-text/60' }, 'Loading...'));
  }

  return createElement(
    'div',
    { className: 'p-6 space-y-6' },
    createElement('h1', { className: 'text-3xl font-bold text-text' }, `Edit Product #${params.id}`),
    error && createElement('div', { className: 'p-3 bg-red-500/10 border border-red-500/30 rounded text-red-500 text-sm' }, error),
    initialData && createElement(ProductForm, {
      onSubmit: handleSubmit,
      onCancel: () => router.push('/admin/products'),
      initialData,
    })
  );
}
