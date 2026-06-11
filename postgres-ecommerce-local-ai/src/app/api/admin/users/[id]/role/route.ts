import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from '@/lib/auth-server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    const targetUserId = params.id;
    const body = await request.json();
    const { isAdmin: grantAdmin } = body;

    if (targetUserId === session.user.id && !grantAdmin) {
      return NextResponse.json({ error: 'Cannot revoke your own admin privileges' }, { status: 403 });
    }

    if (grantAdmin) {
      await pool.query(
        `INSERT INTO public.user_roles (user_id, role) VALUES ($1, 'admin') ON CONFLICT (user_id, role) DO NOTHING`,
        [targetUserId]
      );
    } else {
      await pool.query(
        `DELETE FROM public.user_roles WHERE user_id = $1 AND role = 'admin'`,
        [targetUserId]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to toggle role';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
