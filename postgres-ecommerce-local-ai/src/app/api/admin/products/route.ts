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

export async function GET() {
  try {
    const session = await getServerSession();
    if (!(await checkAdmin(session))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await pool.query(
      `SELECT p.id, p.name, p.description, p.price, p.category_id, c.name AS category_name, p.image_url
       FROM public.products p
       LEFT JOIN public.categories c ON c.id = p.category_id
       ORDER BY p.id`
    );

    return NextResponse.json(result.rows);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const client = await pool.connect();
  try {
    const session = await getServerSession();
    if (!(await checkAdmin(session))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, price, categoryId, imageUrl, variants } = body;

    if (!name || !description || price == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await client.query('BEGIN');

    const productResult = await client.query(
      `INSERT INTO public.products (name, description, price, category_id, image_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [name, description, price, categoryId || null, imageUrl || null]
    );

    const productId = productResult.rows[0].id;

    if (variants && variants.length > 0) {
      for (const v of variants) {
        await client.query(
          `INSERT INTO public.product_variants (product_id, size, color, stock)
           VALUES ($1, $2, $3, $4)`,
          [productId, v.size, v.color, v.stock ?? 0]
        );
      }
    }

    await client.query('COMMIT');
    return NextResponse.json({ id: productId }, { status: 201 });
  } catch (error) {
    await client.query('ROLLBACK');
    const message = error instanceof Error ? error.message : 'Failed to create product';
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    client.release();
  }
}
