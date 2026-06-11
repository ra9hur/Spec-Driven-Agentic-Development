'use client';
import { createElement, useState, useCallback } from 'react';

export interface VariantInput {
  size: string;
  color: string;
  stock: number;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  categoryId: number;
  imageUrl: string;
  variants: VariantInput[];
}

export interface ProductFormProps {
  initialData?: {
    name?: string;
    description?: string;
    price?: number;
    categoryId?: number;
    imageUrl?: string;
    variants?: VariantInput[];
  };
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
}

export function ProductForm({ initialData, onSubmit, onCancel }: ProductFormProps) {
  const [variants, setVariants] = useState<VariantInput[]>(initialData?.variants || []);
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newStock, setNewStock] = useState(0);

  const addVariant = useCallback(() => {
    if (!newSize.trim() || !newColor.trim()) return;
    setVariants((prev) => [...prev, { size: newSize.trim(), color: newColor.trim(), stock: newStock }]);
    setNewSize('');
    setNewColor('');
    setNewStock(0);
  }, [newSize, newColor, newStock]);

  const removeVariant = useCallback((index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data: ProductFormData = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
      price: parseFloat((form.elements.namedItem('price') as HTMLInputElement).value),
      categoryId: parseInt((form.elements.namedItem('categoryId') as HTMLSelectElement).value),
      imageUrl: (form.elements.namedItem('imageUrl') as HTMLInputElement).value,
      variants,
    };
    onSubmit(data);
  };

  return createElement(
    'form',
    { onSubmit: handleSubmit, className: 'space-y-4 max-w-lg' },
    createElement('div', {},
      createElement('label', { htmlFor: 'name', className: 'block text-sm font-medium text-text mb-1' }, 'Name'),
      createElement('input', { id: 'name', name: 'name', defaultValue: initialData?.name, required: true, className: 'w-full bg-canvas border border-border rounded px-3 py-2 text-text focus:outline-none focus:border-accent-primary' })
    ),
    createElement('div', {},
      createElement('label', { htmlFor: 'description', className: 'block text-sm font-medium text-text mb-1' }, 'Description'),
      createElement('textarea', { id: 'description', name: 'description', defaultValue: initialData?.description, required: true, rows: 4, className: 'w-full bg-canvas border border-border rounded px-3 py-2 text-text focus:outline-none focus:border-accent-primary' })
    ),
    createElement('div', {},
      createElement('label', { htmlFor: 'price', className: 'block text-sm font-medium text-text mb-1' }, 'Price'),
      createElement('input', { id: 'price', name: 'price', type: 'number', step: '0.01', defaultValue: initialData?.price, required: true, min: 0, className: 'w-full bg-canvas border border-border rounded px-3 py-2 text-text focus:outline-none focus:border-accent-primary' })
    ),
    createElement('div', {},
      createElement('label', { htmlFor: 'categoryId', className: 'block text-sm font-medium text-text mb-1' }, 'Category'),
      createElement('select', { id: 'categoryId', name: 'categoryId', defaultValue: initialData?.categoryId, required: true, className: 'w-full bg-canvas border border-border rounded px-3 py-2 text-text focus:outline-none focus:border-accent-primary' },
        createElement('option', { value: '' }, 'Select category'),
        createElement('option', { value: '1' }, 'T-shirts'),
        createElement('option', { value: '2' }, 'Hoodies'),
        createElement('option', { value: '3' }, 'Mugs'),
      )
    ),
    createElement('div', {},
      createElement('label', { htmlFor: 'imageUrl', className: 'block text-sm font-medium text-text mb-1' }, 'Image URL'),
      createElement('input', { id: 'imageUrl', name: 'imageUrl', defaultValue: initialData?.imageUrl, className: 'w-full bg-canvas border border-border rounded px-3 py-2 text-text focus:outline-none focus:border-accent-primary' })
    ),
    createElement('div', { className: 'border-t border-border pt-4' },
      createElement('p', { className: 'text-sm font-medium text-text mb-3' }, 'Variants (Size, Color, Stock)'),
      createElement('div', { className: 'space-y-2 mb-3' },
        variants.map((v, i) =>
          createElement('div', { key: i, className: 'flex items-center gap-2 text-sm text-text bg-container p-2 rounded' },
            createElement('span', { className: 'flex-1' }, `${v.size} / ${v.color} (Stock: ${v.stock})`),
            createElement('button', { type: 'button', onClick: () => removeVariant(i), className: 'text-red-500 hover:underline' }, 'Remove')
          )
        )
      ),
      createElement('div', { className: 'flex gap-2 items-end' },
        createElement('div', {},
          createElement('label', { className: 'block text-xs text-text/60 mb-1' }, 'Size'),
          createElement('input', { value: newSize, onChange: (e: any) => setNewSize(e.target.value), placeholder: 'e.g. M', className: 'w-20 bg-canvas border border-border rounded px-2 py-1 text-text text-sm focus:outline-none focus:border-accent-primary' })
        ),
        createElement('div', {},
          createElement('label', { className: 'block text-xs text-text/60 mb-1' }, 'Color'),
          createElement('input', { value: newColor, onChange: (e: any) => setNewColor(e.target.value), placeholder: 'e.g. Black', className: 'w-24 bg-canvas border border-border rounded px-2 py-1 text-text text-sm focus:outline-none focus:border-accent-primary' })
        ),
        createElement('div', {},
          createElement('label', { className: 'block text-xs text-text/60 mb-1' }, 'Stock'),
          createElement('input', { type: 'number', value: newStock, onChange: (e: any) => setNewStock(parseInt(e.target.value) || 0), min: 0, className: 'w-20 bg-canvas border border-border rounded px-2 py-1 text-text text-sm focus:outline-none focus:border-accent-primary' })
        ),
        createElement('button', { type: 'button', onClick: addVariant, className: 'bg-accent-primary text-canvas px-3 py-1 rounded text-sm hover:bg-accent-primary/90 transition-colors' }, 'Add')
      )
    ),
    createElement('div', { className: 'flex gap-3 pt-4' },
      createElement('button', { type: 'submit', className: 'bg-accent-primary text-canvas px-4 py-2 rounded hover:bg-accent-primary/90 transition-colors' }, initialData ? 'Update Product' : 'Create Product'),
      createElement('button', { type: 'button', onClick: onCancel, className: 'border border-border text-text px-4 py-2 rounded hover:bg-canvas transition-colors' }, 'Cancel')
    )
  );
}
