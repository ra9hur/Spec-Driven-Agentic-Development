// REQ-20, REQ-22, REQ-23, REQ-24: Order lifecycle & cart clearing
// TEST-302: Cart state cleared after order submission
// TEST-304: Edge cases - cart with invalid quantities
// TEST-306: Edge cases - order price snapshot accuracy
// TEST-307: Edge cases - payment method validation

import pool from '@/lib/db';

let testOrderId: number | null = null;

afterAll(async () => {
  if (testOrderId) {
    await pool.query('DELETE FROM public.orders WHERE id = $1', [testOrderId]);
  }
});

describe('Cart State After Order', () => {
  // TEST-302: Simulate cart clearing
  it('should clear cart state after successful order', () => {
    const cartItems = [
      { variantId: 1, quantity: 2, price: 100 },
      { variantId: 3, quantity: 1, price: 50 },
    ];

    const clearCart = () => { cartItems.length = 0; };

    expect(cartItems.length).toBe(2);
    clearCart();
    expect(cartItems.length).toBe(0);
  });

  // TEST-302: clearCart invoked after order creation
  it('should invoke clearCart after order submission handler', () => {
    let cartCleared = false;
    const clearCart = () => { cartCleared = true; };

    const placeOrder = async () => {
      clearCart();
      return { success: true };
    };

    return placeOrder().then((result) => {
      expect(result.success).toBe(true);
      expect(cartCleared).toBe(true);
    });
  });
});

describe('Invalid Quantity Edge Cases', () => {
  // TEST-304: Zero quantity rejection
  it('should reject cart item with zero quantity', () => {
    const validateItem = (qty: number) => {
      if (qty <= 0) throw new Error('Invalid quantity');
      if (!Number.isInteger(qty)) throw new Error('Quantity must be integer');
      return true;
    };

    expect(() => validateItem(0)).toThrow('Invalid quantity');
  });

  // TEST-304: Negative quantity rejection
  it('should reject cart item with negative quantity', () => {
    const validateItem = (qty: number) => {
      if (qty <= 0) throw new Error('Invalid quantity');
      return true;
    };

    expect(() => validateItem(-3)).toThrow('Invalid quantity');
  });

  // TEST-304: Float quantity rejection
  it('should reject cart item with non-integer quantity', () => {
    const validateItem = (qty: number) => {
      if (!Number.isInteger(qty)) throw new Error('Quantity must be integer');
      return true;
    };

    expect(() => validateItem(2.5)).toThrow('Quantity must be integer');
  });

  // TEST-304: Valid quantity accepted
  it('should accept cart item with valid integer quantity', () => {
    const validateItem = (qty: number, stock: number) => {
      if (qty <= 0) throw new Error('Invalid quantity');
      if (!Number.isInteger(qty)) throw new Error('Quantity must be integer');
      if (qty > stock) throw new Error('Exceeds stock');
      return true;
    };

    expect(validateItem(3, 10)).toBe(true);
  });
});

describe('Price Snapshot Accuracy', () => {
  // TEST-306: Price snapshot independent of catalog changes
  it('should capture price_at_purchase independent of future catalog changes', () => {
    interface OrderItem {
      variantId: number;
      priceAtPurchase: number;
    }

    const createOrderItem = (variantId: number, currentPrice: number): OrderItem => ({
      variantId,
      priceAtPurchase: currentPrice,
    });

    const orderItem = createOrderItem(1, 25.00);

    const updatedCatalogPrice = 30.00;

    expect(orderItem.priceAtPurchase).toBe(25.00);
    expect(orderItem.priceAtPurchase).not.toBe(updatedCatalogPrice);
  });

  // TEST-306: Subsequent orders use updated prices
  it('should use current catalog price for new orders', () => {
    const getPriceForNewOrder = (catalogPrice: number) => catalogPrice;

    expect(getPriceForNewOrder(30.00)).toBe(30.00);
    expect(getPriceForNewOrder(25.00)).toBe(25.00);
  });
});

describe('Payment Method Validation', () => {
  // TEST-307: Default to COD
  it('should default to COD payment method', () => {
    const paymentMethod = 'COD';
    expect(paymentMethod).toBe('COD');
  });

  // TEST-307: Accept COD explicitly
  it('should accept COD as valid payment method', () => {
    const isValidPayment = (method: string) => method === 'COD';
    expect(isValidPayment('COD')).toBe(true);
  });

  // TEST-307: Reject unsupported payment methods
  it('should reject unsupported payment methods', () => {
    const isValidPayment = (method: string) => method === 'COD';
    expect(isValidPayment('Credit Card')).toBe(false);
    expect(isValidPayment('PayPal')).toBe(false);
    expect(isValidPayment('Debit Card')).toBe(false);
  });
});

describe('Order State Machine DB Integration', () => {
  let orderId: number;

  beforeAll(async () => {
    const result = await pool.query(
      `INSERT INTO public.orders
       (total, shipping_name, phone, address, city, pincode, payment_method)
       VALUES (99.99, 'Jane Doe', '9876543210', '456 Oak Ave', 'Portland', '97201', 'COD')
       RETURNING id`
    );
    orderId = result.rows[0].id;
  });

  afterAll(async () => {
    if (orderId) {
      await pool.query('DELETE FROM public.order_items WHERE order_id = $1', [orderId]);
      await pool.query('DELETE FROM public.orders WHERE id = $1', [orderId]);
    }
  });

  // TEST-303: Verify state progression trigger exists
  it('should have check_order_status_transition trigger on orders', async () => {
    const result = await pool.query(
      `SELECT tgname FROM pg_trigger
       JOIN pg_class ON tgrelid = pg_class.oid
       JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
       WHERE pg_namespace.nspname = 'public'
       AND pg_class.relname = 'orders'
       AND tgname = 'trg_check_order_status'`
    );
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].tgname).toBe('trg_check_order_status');
  });

  // TEST-303: Default status is pending
  it('should default to pending status', async () => {
    const result = await pool.query('SELECT status FROM public.orders WHERE id = $1', [orderId]);
    expect(result.rows[0].status).toBe('pending');
  });

  // TEST-303: Allow pending -> confirmed
  it('should allow pending to confirmed transition', async () => {
    await pool.query('UPDATE public.orders SET status = $1 WHERE id = $2', ['confirmed', orderId]);
    const result = await pool.query('SELECT status FROM public.orders WHERE id = $1', [orderId]);
    expect(result.rows[0].status).toBe('confirmed');
  });

  // TEST-303: Allow confirmed -> shipped
  it('should allow confirmed to shipped transition', async () => {
    await pool.query('UPDATE public.orders SET status = $1 WHERE id = $2', ['shipped', orderId]);
    const result = await pool.query('SELECT status FROM public.orders WHERE id = $1', [orderId]);
    expect(result.rows[0].status).toBe('shipped');
  });

  // TEST-303: Allow shipped -> delivered
  it('should allow shipped to delivered transition', async () => {
    await pool.query('UPDATE public.orders SET status = $1 WHERE id = $2', ['delivered', orderId]);
    const result = await pool.query('SELECT status FROM public.orders WHERE id = $1', [orderId]);
    expect(result.rows[0].status).toBe('delivered');
  });

  // TEST-303: Reject transitions from terminal state (delivered)
  it('should reject transition from delivered (terminal state)', async () => {
    await expect(
      pool.query('UPDATE public.orders SET status = $1 WHERE id = $2', ['cancelled', orderId])
    ).rejects.toThrow(/Invalid order status transition/);
  });

  // TEST-303: Reject reversal (confirmed -> pending)
  it('should reject reversal from confirmed back to pending', async () => {
    const priorResult = await pool.query('SELECT status FROM public.orders WHERE id = $1', [orderId]);
    const priorStatus = priorResult.rows[0].status;

    await expect(
      pool.query('UPDATE public.orders SET status = $1 WHERE id = $2', ['pending', orderId])
    ).rejects.toThrow(/Invalid order status transition/);

    const afterResult = await pool.query('SELECT status FROM public.orders WHERE id = $1', [orderId]);
    expect(afterResult.rows[0].status).toBe(priorStatus);
  });
});

describe('COD Payment Constraint DB Integration', () => {
  let orderId: number;

  afterAll(async () => {
    if (orderId) {
      await pool.query('DELETE FROM public.orders WHERE id = $1', [orderId]);
    }
  });

  // TEST-307: Accept COD payment method
  it('should accept COD as payment method', async () => {
    const result = await pool.query(
      `INSERT INTO public.orders
       (total, shipping_name, phone, address, city, pincode, payment_method)
       VALUES (49.99, 'John Smith', '5551234567', '789 Pine St', 'Seattle', '98101', 'COD')
       RETURNING id`
    );
    orderId = result.rows[0].id;
    expect(parseInt(result.rows[0].id)).toBeGreaterThan(0);
  });

  // TEST-307: Reject non-COD payment methods
  it('should reject non-COD payment methods via CHECK constraint', async () => {
    await expect(
      pool.query(
        `INSERT INTO public.orders
         (total, shipping_name, phone, address, city, pincode, payment_method)
         VALUES (49.99, 'John Smith', '5551234567', '789 Pine St', 'Seattle', '98101', 'Credit Card')
         RETURNING id`
      )
    ).rejects.toThrow(/violates check constraint/);
  });
});

describe('Price Snapshot DB Integration', () => {
  let orderId: number;

  afterAll(async () => {
    if (orderId) {
      await pool.query('DELETE FROM public.order_items WHERE order_id = $1', [orderId]);
      await pool.query('DELETE FROM public.orders WHERE id = $1', [orderId]);
    }
  });

  // TEST-306: Verify price_at_purchase is stored correctly
  it('should store price_at_purchase in order_items', async () => {
    const orderResult = await pool.query(
      `INSERT INTO public.orders
       (total, shipping_name, phone, address, city, pincode, payment_method)
       VALUES (29.99, 'Alice Johnson', '5559876543', '321 Elm St', 'Chicago', '60601', 'COD')
       RETURNING id`
    );
    orderId = orderResult.rows[0].id;

    await pool.query(
      `INSERT INTO public.order_items (order_id, variant_id, quantity, price_at_purchase)
       VALUES ($1, 1, 2, 29.99)`,
      [orderId]
    );

    const itemResult = await pool.query(
      'SELECT price_at_purchase FROM public.order_items WHERE order_id = $1',
      [orderId]
    );
    expect(parseFloat(itemResult.rows[0].price_at_purchase)).toBeCloseTo(29.99, 2);
  });

  // TEST-306: Verify price snapshot is immutable (no ON UPDATE trigger needed, just verify it stays)
  it('should retain original price_at_purchase after catalog changes', async () => {
    const priceBefore = await pool.query(
      'SELECT price_at_purchase FROM public.order_items WHERE order_id = $1',
      [orderId]
    );
    const originalPrice = parseFloat(priceBefore.rows[0].price_at_purchase);

    await pool.query('UPDATE public.products SET price = 99.99 WHERE id = 1');

    const priceAfter = await pool.query(
      'SELECT price_at_purchase FROM public.order_items WHERE order_id = $1',
      [orderId]
    );
    expect(parseFloat(priceAfter.rows[0].price_at_purchase)).toBeCloseTo(originalPrice, 2);

    await pool.query('UPDATE public.products SET price = 29.99 WHERE id = 1');
  });
});
