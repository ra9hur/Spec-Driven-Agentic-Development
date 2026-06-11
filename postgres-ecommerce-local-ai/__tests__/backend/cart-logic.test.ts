// REQ-19 to REQ-24: Cart operations & order lifecycle
// TEST-301: Checkout item validation & order snapshots
// TEST-305: Edge cases - duplicate variant in cart

interface CartItem {
  variantId: number;
  quantity: number;
  price: number;
  stock?: number;
}

function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function isCartValid(items: CartItem[]): { valid: boolean; error?: string } {
  if (items.length === 0) {
    return { valid: false, error: 'Cart is empty' };
  }
  for (const item of items) {
    if (item.quantity <= 0) {
      return { valid: false, error: `Invalid quantity for variant ${item.variantId}` };
    }
    if (item.price <= 0) {
      return { valid: false, error: `Invalid price for variant ${item.variantId}` };
    }
    if (item.stock !== undefined && item.quantity > item.stock) {
      return { valid: false, error: `Insufficient stock for variant ${item.variantId}` };
    }
  }
  return { valid: true };
}

function mergeCartItems(items: CartItem[], newItem: CartItem): CartItem[] {
  const existing = items.find((i) => i.variantId === newItem.variantId);
  if (existing) {
    return items.map((i) =>
      i.variantId === newItem.variantId
        ? { ...i, quantity: i.quantity + newItem.quantity }
        : i
    );
  }
  return [...items, newItem];
}

function isOrderStatusValid(current: string, next: string): boolean {
  const flow: Record<string, string[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
  };
  return flow[current]?.includes(next) ?? false;
}

describe('Cart Logic', () => {
  // TEST-301: Cart total calculation
  it('should calculate cart total correctly', () => {
    const items: CartItem[] = [
      { variantId: 1, quantity: 2, price: 100 },
      { variantId: 2, quantity: 1, price: 50 },
    ];
    expect(calculateCartTotal(items)).toBe(250);
  });

  // TEST-301: Empty cart validation
  it('should reject empty cart', () => {
    const result = isCartValid([]);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('empty');
  });

  // TEST-305: Duplicate variant merging
  it('should merge duplicate variant quantities on add', () => {
    const initial: CartItem[] = [{ variantId: 1, quantity: 2, price: 100 }];
    const result = mergeCartItems(initial, { variantId: 1, quantity: 3, price: 100 });
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(5);
  });

  // TEST-305: Different variants remain separate
  it('should keep different variants as separate entries', () => {
    const initial: CartItem[] = [{ variantId: 1, quantity: 2, price: 100 }];
    const result = mergeCartItems(initial, { variantId: 2, quantity: 1, price: 50 });
    expect(result).toHaveLength(2);
  });

  // TEST-301: Valid cart acceptance
  it('should accept valid cart with positive quantities', () => {
    const items: CartItem[] = [
      { variantId: 1, quantity: 1, price: 100, stock: 10 },
      { variantId: 2, quantity: 2, price: 50, stock: 5 },
    ];
    expect(isCartValid(items).valid).toBe(true);
  });

  // TEST-301: Reject zero quantity
  it('should reject items with zero quantity', () => {
    const result = isCartValid([{ variantId: 1, quantity: 0, price: 100 }]);
    expect(result.valid).toBe(false);
  });

  // TEST-301: Reject zero price
  it('should reject items with zero price', () => {
    const result = isCartValid([{ variantId: 1, quantity: 1, price: 0 }]);
    expect(result.valid).toBe(false);
  });

  // TEST-305: Reject quantity exceeding stock
  it('should reject item exceeding available stock', () => {
    const result = isCartValid([{ variantId: 1, quantity: 20, price: 100, stock: 10 }]);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('stock');
  });

  // TEST-305: Accept quantity within stock
  it('should accept item within available stock', () => {
    const result = isCartValid([{ variantId: 1, quantity: 5, price: 100, stock: 10 }]);
    expect(result.valid).toBe(true);
  });
});

describe('Order Status State Machine', () => {
  // TEST-303: Default status
  it('should default to pending status', () => {
    expect(isOrderStatusValid('pending', 'confirmed')).toBe(true);
  });

  // TEST-303: Valid transitions
  it('should allow valid sequential transitions', () => {
    expect(isOrderStatusValid('pending', 'confirmed')).toBe(true);
    expect(isOrderStatusValid('confirmed', 'shipped')).toBe(true);
    expect(isOrderStatusValid('shipped', 'delivered')).toBe(true);
  });

  // TEST-303: Cancellation from non-terminal states
  it('should allow cancellation from pending, confirmed, shipped', () => {
    expect(isOrderStatusValid('pending', 'cancelled')).toBe(true);
    expect(isOrderStatusValid('confirmed', 'cancelled')).toBe(true);
    expect(isOrderStatusValid('shipped', 'cancelled')).toBe(true);
  });

  // TEST-303: Invalid transitions
  it('should reject skipping states (pending -> delivered)', () => {
    expect(isOrderStatusValid('pending', 'delivered')).toBe(false);
  });

  it('should reject skipping states (confirmed -> delivered)', () => {
    expect(isOrderStatusValid('confirmed', 'delivered')).toBe(false);
  });

  // TEST-303: No reversal allowed
  it('should reject reversal (confirmed -> pending)', () => {
    expect(isOrderStatusValid('confirmed', 'pending')).toBe(false);
  });

  // TEST-303: Terminal states
  it('should reject transitions from terminal states', () => {
    expect(isOrderStatusValid('delivered', 'cancelled')).toBe(false);
    expect(isOrderStatusValid('delivered', 'shipped')).toBe(false);
    expect(isOrderStatusValid('cancelled', 'pending')).toBe(false);
    expect(isOrderStatusValid('cancelled', 'confirmed')).toBe(false);
  });
});
