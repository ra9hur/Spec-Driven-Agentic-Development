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
      `SELECT p.id, au.email, p.display_name, p.updated_at,
              CASE WHEN EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'admin') THEN 'admin' ELSE 'user' END AS role
       FROM public.profiles p
       LEFT JOIN auth.users au ON au.id = p.id
       ORDER BY p.updated_at DESC`
    );

    const users = result.rows.map((row: any) => ({
      id: row.id,
      email: row.email || '',
      displayName: row.display_name,
      role: row.role,
      createdAt: new Date(row.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    }));

    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
