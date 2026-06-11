import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from '@/lib/auth-server';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await pool.query(
      `SELECT public.has_role('admin'::public.user_role_enum, $1) AS is_admin`,
      [session.user.id]
    );

    if (!isAdmin.rows[0]?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await pool.query(
      `SELECT id, total, status, shipping_name AS customer, created_at
       FROM public.orders ORDER BY created_at DESC`
    );

    const orders = result.rows.map((row: any) => ({
      id: row.id,
      orderId: 'ORD-' + row.id.toString().padStart(8, '0'),
      customer: row.customer,
      total: parseFloat(row.total),
      status: row.status,
      date: new Date(row.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    }));

    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
