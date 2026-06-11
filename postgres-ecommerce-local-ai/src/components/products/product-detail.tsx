import { createElement, useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/shared/button';

export interface ProductDetailProps {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  variants: Array<{ id: number; size: string; color: string; stock: number }>;
}

export function ProductDetail({ id, name, description, price, imageUrl, variants }: ProductDetailProps) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [selectedVariant, setSelectedVariant] = useState<typeof variants[0] | null>(null);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (!selectedVariant) {
      showToast('Please select a variant', 'error');
      return;
    }
    if (selectedVariant.stock < quantity) {
      showToast('Insufficient stock', 'error');
      return;
    }
    addItem({
      variantId: selectedVariant.id,
      productId: id,
      quantity,
      price,
      name,
      size: selectedVariant.size,
      color: selectedVariant.color,
      imageUrl,
    });
    showToast('Added to cart', 'success');
  };

  return createElement(
    'div',
    { className: 'grid lg:grid-cols-2 gap-8' },
    createElement(
      'div',
      {},
      createElement(
        'div',
        { className: 'aspect-square bg-canvas rounded-lg overflow-hidden' },
        imageUrl && createElement('img', {
          src: imageUrl,
          alt: name,
          className: 'w-full h-full object-cover',
        })
      )
    ),
    createElement(
      'div',
      { className: 'space-y-6' },
      createElement('h1', { className: 'text-3xl font-bold text-text' }, name),
      createElement('p', { className: 'text-text/80 text-lg' }, `$${price.toFixed(2)}`),
      createElement('p', { className: 'text-text/60' }, description),

      variants.length > 0 && createElement(
        'div',
        { className: 'space-y-4' },
        createElement('label', { className: 'block text-sm font-medium text-text' }, 'Size'),
        createElement(
          'div',
          { className: 'flex gap-2 flex-wrap' },
          [...new Set(variants.map((v) => v.size))].map((size) => (
            createElement(
              'button',
              {
                key: size,
                onClick: () => setSelectedVariant(
                  variants.find((v) => v.size === size && v.color === selectedVariant?.color) ||
                  variants.find((v) => v.size === size) ||
                  null
                ),
                className: `px-4 py-2 rounded border transition-colors ${
                  selectedVariant?.size === size
                    ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                    : 'border-border text-text hover:border-accent-primary'
                }`,
              },
              size
            )
          ))
        ),

        createElement('label', { className: 'block text-sm font-medium text-text' }, 'Color'),
        createElement(
          'div',
          { className: 'flex gap-2 flex-wrap' },
          [...new Set(variants.map((v) => v.color))].map((color) => (
            createElement(
              'button',
              {
                key: color,
                onClick: () => setSelectedVariant(
                  variants.find((v) => v.color === color && v.size === selectedVariant?.size) ||
                  variants.find((v) => v.color === color) ||
                  null
                ),
                className: `px-4 py-2 rounded border transition-colors ${
                  selectedVariant?.color === color
                    ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                    : 'border-border text-text hover:border-accent-primary'
                }`,
              },
              color
            )
          ))
        )
      ),

      createElement(
        'div',
        { className: 'flex items-center gap-4' },
        createElement(
          'label',
          { className: 'text-sm font-medium text-text' },
          'Qty'
        ),
        createElement(
          'div',
          { className: 'flex items-center border border-border rounded' },
          createElement('button', {
            onClick: () => setQuantity(Math.max(1, quantity - 1)),
            className: 'px-3 py-2 text-text hover:bg-container',
          }, '−'),
          createElement('input', {
            type: 'number',
            value: quantity,
            onChange: (e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1)),
            className: 'w-16 text-center border-x border-border bg-transparent text-text focus:outline-none',
            min: 1,
            max: selectedVariant?.stock || 99,
          }),
          createElement('button', {
            onClick: () => setQuantity(quantity + 1),
            className: 'px-3 py-2 text-text hover:bg-container',
          }, '+')
        )
      ),

      createElement(
        Button,
        { onClick: handleAddToCart, className: 'w-full py-3 text-lg' },
        'Add to Cart'
      )
    )
  );
}
