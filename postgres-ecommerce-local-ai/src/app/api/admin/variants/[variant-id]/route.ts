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

export async function GET(_request: NextRequest, { params }: { params: { ['variant-id']: string } }) {
  try {
    const session = await getServerSession();
    if (!(await checkAdmin(session))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const variantId = parseInt(params['variant-id'], 10);
    const result = await pool.query(
      `SELECT pv.*, p.name AS product_name FROM public.product_variants pv
       JOIN public.products p ON p.id = pv.product_id
       WHERE pv.id = $1`,
      [variantId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch variant' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { ['variant-id']: string } }) {
  try {
    const session = await getServerSession();
    if (!(await checkAdmin(session))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const variantId = parseInt(params['variant-id'], 10);
    const body = await request.json();
    const { stock } = body;

    if (stock == null || stock < 0) {
      return NextResponse.json({ error: 'Stock must be a non-negative number' }, { status: 400 });
    }

    await pool.query(
      'UPDATE public.product_variants SET stock = $1 WHERE id = $2',
      [stock, variantId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update variant';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
