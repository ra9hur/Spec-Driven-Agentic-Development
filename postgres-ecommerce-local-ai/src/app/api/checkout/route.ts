import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from '@/lib/auth-server';

interface CartItemInput {
  variantId: number;
  quantity: number;
}

interface CheckoutBody {
  items: CartItemInput[];
  shipping: {
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
    notes?: string;
  };
}

export async function POST(request: NextRequest) {
  const client = await pool.connect();
  try {
    const body: CheckoutBody = await request.json();

    const { items, shipping } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (!shipping?.name || !shipping?.phone || !shipping?.address || !shipping?.city || !shipping?.pincode) {
      return NextResponse.json({ error: 'Missing required shipping fields' }, { status: 400 });
    }

    for (const item of items) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return NextResponse.json(
          { error: `Invalid quantity for variant ${item.variantId}` },
          { status: 400 }
        );
      }
    }

    const session = await getServerSession();

    await client.query('BEGIN');

    const variantIds = items.map((i) => i.variantId);
    const variantsResult = await client.query(
      `SELECT pv.id, pv.stock, pv.product_id, p.price
       FROM product_variants pv
       JOIN products p ON p.id = pv.product_id
       WHERE pv.id = ANY($1::bigint[])`,
      [variantIds]
    );

    const variantMap = new Map(variantsResult.rows.map((r) => [r.id, r]));

    for (const item of items) {
      const variant = variantMap.get(item.variantId);
      if (!variant) {
        throw new Error(`Variant ${item.variantId} not found`);
      }
      if (item.quantity > variant.stock) {
        throw new Error(`Insufficient stock for variant ${item.variantId}: requested ${item.quantity}, available ${variant.stock}`);
      }
    }

    let total = 0;
    const orderItemsData = items.map((item) => {
      const variant = variantMap.get(item.variantId)!;
      const priceAtPurchase = parseFloat(variant.price);
      total += priceAtPurchase * item.quantity;
      return {
        variantId: item.variantId,
        quantity: item.quantity,
        priceAtPurchase,
      };
    });

    const orderResult = await client.query(
      `INSERT INTO public.orders
       (user_id, total, status, shipping_name, phone, address, city, pincode, notes, payment_method)
       VALUES ($1, $2, 'pending', $3, $4, $5, $6, $7, $8, 'COD')
       RETURNING id`,
      [
        session?.user?.id || null,
        total.toFixed(2),
        shipping.name,
        shipping.phone,
        shipping.address,
        shipping.city,
        shipping.pincode,
        shipping.notes || null,
      ]
    );

    const orderId = orderResult.rows[0].id;

    for (const oi of orderItemsData) {
      await client.query(
        `INSERT INTO public.order_items (order_id, variant_id, quantity, price_at_purchase)
         VALUES ($1, $2, $3, $4)`,
        [orderId, oi.variantId, oi.quantity, oi.priceAtPurchase.toFixed(2)]
      );
    }

    await client.query('COMMIT');

    return NextResponse.json({ orderId, total: total.toFixed(2) }, { status: 201 });
  } catch (error) {
    await client.query('ROLLBACK');
    const message = error instanceof Error ? error.message : 'Checkout failed';
    return NextResponse.json({ error: message }, { status: 400 });
  } finally {
    client.release();
  }
}
