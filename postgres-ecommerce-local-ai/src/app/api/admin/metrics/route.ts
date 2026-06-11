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

    const totalOrdersResult = await pool.query('SELECT COUNT(*)::int AS count FROM public.orders');
    const revenueResult = await pool.query(
      "SELECT COALESCE(SUM(total), 0)::numeric(10,2) AS total FROM public.orders WHERE status != 'cancelled'"
    );
    const pendingResult = await pool.query(
      "SELECT COUNT(*)::int AS count FROM public.orders WHERE status = 'pending'"
    );

    return NextResponse.json({
      totalOrders: totalOrdersResult.rows[0].count,
      revenue: parseFloat(revenueResult.rows[0].total),
      pendingShipments: pendingResult.rows[0].count,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
