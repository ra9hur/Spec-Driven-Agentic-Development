'use client';
import { useCartContext } from '@/contexts/cart-context';

export interface CartItem {
  variantId: number;
  productId: number;
  quantity: number;
  price: number;
  name: string;
  size?: string;
  color?: string;
  imageUrl?: string;
}

export function useCart() {
  return useCartContext();
}
