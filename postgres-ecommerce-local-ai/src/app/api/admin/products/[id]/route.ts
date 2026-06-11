import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from '@/lib/auth-server';

async function checkAdmin(session: any) {
  if (!session) return false;
  const result = await pool.query(
    `SELECT public.has_role('admin'::public.user_role_enum, $1) AS is_admin`,
    [session.user.id]
  );
  return result.rows[0]?.is_admin === true;
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!(await checkAdmin(session))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const productId = parseInt(params.id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const productResult = await pool.query(
      'SELECT id, name, description, price, category_id, image_url FROM public.products WHERE id = $1',
      [productId]
    );

    if (productResult.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const variantsResult = await pool.query(
      'SELECT id, size, color, stock FROM public.product_variants WHERE product_id = $1 ORDER BY size, color',
      [productId]
    );

    return NextResponse.json({
      ...productResult.rows[0],
      variants: variantsResult.rows,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const client = await pool.connect();
  try {
    const session = await getServerSession();
    if (!(await checkAdmin(session))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const productId = parseInt(params.id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, price, categoryId, imageUrl, variants } = body;

    if (!name || !description || price == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await client.query('BEGIN');

    await client.query(
      `UPDATE public.products SET name = $1, description = $2, price = $3, category_id = $4, image_url = $5 WHERE id = $6`,
      [name, description, price, categoryId || null, imageUrl || null, productId]
    );

    if (variants) {
      await client.query('DELETE FROM public.product_variants WHERE product_id = $1', [productId]);
      for (const v of variants) {
        await client.query(
          `INSERT INTO public.product_variants (product_id, size, color, stock) VALUES ($1, $2, $3, $4)`,
          [productId, v.size, v.color, v.stock ?? 0]
        );
      }
    }

    await client.query('COMMIT');
    return NextResponse.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    const message = error instanceof Error ? error.message : 'Failed to update product';
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!(await checkAdmin(session))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const productId = parseInt(params.id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    await pool.query('DELETE FROM public.products WHERE id = $1', [productId]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
