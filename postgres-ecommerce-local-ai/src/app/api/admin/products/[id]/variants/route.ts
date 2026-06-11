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

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!(await checkAdmin(session))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const productId = parseInt(params.id, 10);
    const body = await request.json();
    const { size, color, stock } = body;

    if (!size || !color) {
      return NextResponse.json({ error: 'Size and color are required' }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO public.product_variants (product_id, size, color, stock) VALUES ($1, $2, $3, $4) RETURNING id`,
      [productId, size, color, stock ?? 0]
    );

    return NextResponse.json({ id: result.rows[0].id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create variant';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
