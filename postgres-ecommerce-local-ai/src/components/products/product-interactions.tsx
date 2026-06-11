'use client';
import { createElement, useState, useCallback } from 'react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/shared/button';

interface VariantInfo {
  id: number;
  size: string;
  color: string;
  stock: number;
}

interface ProductInteractionsProps {
  productId: number;
  productName: string;
  productPrice: number;
  imageUrl?: string;
  variants: VariantInfo[];
  sizes: string[];
  colors: string[];
}

export function ProductInteractions({ productId, productName, productPrice, imageUrl, variants, sizes, colors }: ProductInteractionsProps) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || '');
  const [selectedColor, setSelectedColor] = useState<string>(colors[0] || '');

  const selectedVariant = variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );

  const handleAddToCart = useCallback(() => {
    if (!selectedVariant || selectedVariant.stock <= 0) return;
    addItem({
      variantId: selectedVariant.id,
      productId,
      quantity: 1,
      price: productPrice,
      name: productName,
      size: selectedSize,
      color: selectedColor,
      imageUrl,
    });
  }, [selectedVariant, selectedSize, selectedColor, productId, productPrice, productName, addItem]);

  return createElement(
    'div',
    { className: 'space-y-6' },
    createElement(
      'div',
      {},
      createElement('p', { className: 'text-sm text-text/60 mb-2' }, 'Size'),
      createElement(
        'div',
        { className: 'flex gap-2 flex-wrap' },
        sizes.map((size) =>
          createElement(
            'button',
            {
              key: size,
              onClick: () => setSelectedSize(size),
              className: selectedSize === size
                ? 'px-4 py-2 bg-accent-primary text-canvas rounded font-medium transition-colors'
                : 'px-4 py-2 bg-container border border-border text-text rounded hover:border-accent-primary/50 transition-colors',
            },
            size
          )
        )
      )
    ),
    createElement(
      'div',
      {},
      createElement('p', { className: 'text-sm text-text/60 mb-2' }, 'Color'),
      createElement(
        'div',
        { className: 'flex gap-2 flex-wrap' },
        colors.map((color) =>
          createElement(
            'button',
            {
              key: color,
              onClick: () => setSelectedColor(color),
              className: selectedColor === color
                ? 'px-4 py-2 bg-accent-primary text-canvas rounded font-medium transition-colors'
                : 'px-4 py-2 bg-container border border-border text-text rounded hover:border-accent-primary/50 transition-colors',
            },
            color
          )
        )
      )
    ),
    selectedVariant && createElement(
      'p',
      { className: 'text-sm text-text/40' },
      selectedVariant.stock > 0 ? `${selectedVariant.stock} in stock` : 'Out of stock'
    ),
    createElement(
      Button,
      {
        onClick: handleAddToCart,
        disabled: !selectedVariant || selectedVariant.stock <= 0,
        className: 'w-full',
      },
      'Add to Cart'
    )
  );
}
