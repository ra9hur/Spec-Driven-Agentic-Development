'use client';
import { createElement, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EditVariantPage({ params }: { params: { ['variant-id']: string } }) {
  const router = useRouter();
  const [stock, setStock] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/variants/${params['variant-id']}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setStock(data.stock);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params['variant-id']]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/variants/${params['variant-id']}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to update');
      }
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return createElement('div', { className: 'p-6' }, createElement('p', { className: 'text-text/60' }, 'Loading...'));
  }

  return createElement(
    'div',
    { className: 'p-6 space-y-6' },
    createElement('h1', { className: 'text-3xl font-bold text-text' }, `Edit Variant #${params['variant-id']}`),
    error && createElement('div', { className: 'p-3 bg-red-500/10 border border-red-500/30 rounded text-red-500 text-sm' }, error),
    createElement(
      'form',
      { onSubmit: handleSubmit, className: 'max-w-md space-y-4' },
      createElement('div', {},
        createElement('label', { className: 'block text-sm font-medium text-text mb-1' }, 'Stock Quantity'),
        createElement('input', { type: 'number', value: stock, onChange: (e: any) => setStock(parseInt(e.target.value) || 0), min: 0, required: true, className: 'w-full bg-canvas border border-border rounded px-3 py-2 text-text focus:outline-none focus:border-accent-primary' })
      ),
      createElement('div', { className: 'flex gap-3' },
        createElement('button', { type: 'submit', disabled: saving, className: 'bg-accent-primary text-canvas px-4 py-2 rounded hover:bg-accent-primary/90 disabled:opacity-50 transition-colors' }, saving ? 'Saving...' : 'Update'),
        createElement('button', { type: 'button', onClick: () => router.back(), className: 'border border-border text-text px-4 py-2 rounded hover:bg-canvas transition-colors' }, 'Cancel')
      )
    )
  );
}
