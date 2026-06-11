import { createElement } from 'react';

export interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => void;
  disabled?: boolean;
}

export interface CheckoutFormData {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  notes?: string;
}

export function CheckoutForm({ onSubmit, disabled }: CheckoutFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data: CheckoutFormData = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
      address: (form.elements.namedItem('address') as HTMLTextAreaElement).value,
      city: (form.elements.namedItem('city') as HTMLInputElement).value,
      pincode: (form.elements.namedItem('pincode') as HTMLInputElement).value,
      notes: (form.elements.namedItem('notes') as HTMLTextAreaElement).value,
    };
    onSubmit(data);
  };

  return createElement(
    'form',
    { onSubmit: handleSubmit, 'data-testid': 'checkout-form', className: 'space-y-6' },
    createElement('h2', { className: 'text-2xl font-bold text-text' }, 'Shipping Details'),
    ...['name', 'phone', 'city', 'pincode'].map((field) =>
      createElement(
        'div',
        { key: field },
        createElement('label', { htmlFor: field, className: 'block text-sm font-medium text-text mb-1' }, field.charAt(0).toUpperCase() + field.slice(1)),
        createElement('input', {
          id: field,
          name: field,
          required: true,
          className: 'w-full bg-canvas border border-border rounded px-3 py-2 text-text placeholder-text/30 focus:outline-none focus:border-accent-primary',
          placeholder: `Enter your ${field}`,
        })
      )
    ),
    createElement(
      'div',
      {},
      createElement('label', { htmlFor: 'address', className: 'block text-sm font-medium text-text mb-1' }, 'Address'),
      createElement('textarea', {
        id: 'address',
        name: 'address',
        required: true,
        rows: 3,
        className: 'w-full bg-canvas border border-border rounded px-3 py-2 text-text placeholder-text/30 focus:outline-none focus:border-accent-primary',
        placeholder: 'Enter your full address',
      })
    ),
    createElement(
      'div',
      {},
      createElement('label', { htmlFor: 'notes', className: 'block text-sm font-medium text-text mb-1' }, 'Order Notes (Optional)'),
      createElement('textarea', {
        id: 'notes',
        name: 'notes',
        rows: 2,
        className: 'w-full bg-canvas border border-border rounded px-3 py-2 text-text placeholder-text/30 focus:outline-none focus:border-accent-primary',
        placeholder: 'Any special instructions?',
      })
    ),
    createElement(
      'button',
      {
        type: 'submit',
        disabled: disabled,
        className: 'w-full bg-accent-primary text-canvas font-medium py-3 rounded hover:bg-accent-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
      },
      disabled ? 'Processing...' : 'Place Order (COD)'
    )
  );
}
