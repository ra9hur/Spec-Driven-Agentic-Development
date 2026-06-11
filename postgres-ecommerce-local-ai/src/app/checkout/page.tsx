'use client';
import { createElement, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CheckoutForm, CheckoutFormData } from '@/components/checkout/checkout-form';
import { OrderSummary } from '@/components/checkout/order-summary';
import { useCart } from '@/hooks/use-cart';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async (data: CheckoutFormData) => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          shipping: data,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || 'Checkout failed');
      }
      clearCart();
      const orderRef = 'ORD-' + body.orderId.toString(36).toUpperCase().padStart(8, '0');
      router.push(`/checkout/confirmation?orderId=${orderRef}&name=${encodeURIComponent(data.name)}&total=${body.total || items.reduce((sum, i) => sum + i.price * i.quantity, 0)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  }, [items, clearCart, router]);

  return createElement(
    'div',
    { className: 'max-w-7xl mx-auto p-6' },
    createElement('h1', { className: 'text-3xl font-bold text-text mb-8' }, 'Checkout'),
    error && createElement(
      'div',
      { className: 'mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded' },
      error
    ),
    createElement(
      'div',
      { className: 'grid lg:grid-cols-5 gap-8' },
      createElement(
        'div',
        { className: 'lg:col-span-3' },
        createElement(CheckoutForm, { onSubmit: handleSubmit, disabled: submitting })
      ),
      createElement(
        'div',
        { className: 'lg:col-span-2' },
        createElement(OrderSummary, {})
      )
    )
  );
}
