import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from '@/lib/auth-server';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

    const orderId = parseInt(params.id, 10);
    const body = await request.json();
    const { status: newStatus } = body;

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const currentResult = await pool.query('SELECT status FROM public.orders WHERE id = $1', [orderId]);
    if (currentResult.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await pool.query('UPDATE public.orders SET status = $1 WHERE id = $2', [newStatus, orderId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update order status';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
