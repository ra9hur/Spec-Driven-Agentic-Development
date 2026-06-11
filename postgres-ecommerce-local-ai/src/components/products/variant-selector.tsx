import { createElement } from 'react';

export interface VariantSelectorProps {
  variants: Array<{ size: string; color: string }>;
  selectedSize?: string;
  selectedColor?: string;
  onSizeChange: (size: string) => void;
  onColorChange: (color: string) => void;
}

export function VariantSelector({ variants, selectedSize, selectedColor, onSizeChange, onColorChange }: VariantSelectorProps) {
  const sizes = [...new Set(variants.map((v) => v.size))];
  const colors = [...new Set(variants.map((v) => v.color))];

  return createElement(
    'div',
    { className: 'space-y-4' },
    sizes.length > 0 && createElement(
      'div',
      {},
      createElement('label', { className: 'block text-sm font-medium text-text mb-2' }, 'Size'),
      createElement(
        'div',
        { className: 'flex gap-2 flex-wrap' },
        sizes.map((size) => createElement(
          'button',
          {
            key: size,
            onClick: () => onSizeChange(size),
            className: `px-4 py-2 rounded border transition-colors ${
              selectedSize === size
                ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                : 'border-border text-text hover:border-accent-primary'
            }`,
          },
          size
        ))
      )
    ),

    colors.length > 0 && createElement(
      'div',
      {},
      createElement('label', { className: 'block text-sm font-medium text-text mb-2' }, 'Color'),
      createElement(
        'div',
        { className: 'flex gap-2 flex-wrap' },
        colors.map((color) => createElement(
          'button',
          {
            key: color,
            onClick: () => onColorChange(color),
            className: `px-4 py-2 rounded border transition-colors ${
              selectedColor === color
                ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                : 'border-border text-text hover:border-accent-primary'
            }`,
          },
          color
        ))
      )
    )
  );
}
