'use client';
import { Suspense, createElement } from 'react';
import { useSearchParams } from 'next/navigation';
import { Confirmation } from '@/components/checkout/confirmation';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'N/A';
  const customerName = searchParams.get('name') || 'Customer';
  const total = parseFloat(searchParams.get('total') || '0');

  return createElement(
    'div',
    { className: 'max-w-7xl mx-auto p-6' },
    createElement(Confirmation, { orderId, customerName, total })
  );
}

export default function ConfirmationPage() {
  return createElement(
    Suspense,
    { fallback: createElement('div', { className: 'text-center text-text/60 py-12' }, 'Loading confirmation...') },
    createElement(ConfirmationContent)
  );
}
