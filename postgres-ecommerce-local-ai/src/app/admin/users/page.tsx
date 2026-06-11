import { createElement } from 'react';
import pool from '@/lib/db';
import { getServerSession } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import { UserGrid, User } from '@/components/admin/user-grid';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const session = await getServerSession();
  if (!session) redirect('/auth/login');

  const isAdmin = await pool.query(
    `SELECT public.has_role('admin'::public.user_role_enum, $1) AS is_admin`,
    [session.user.id]
  );
  if (!isAdmin.rows[0]?.is_admin) redirect('/auth/login');

  const result = await pool.query(
    `SELECT p.id, au.email, p.display_name,
            CASE WHEN EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'admin') THEN 'admin' ELSE 'user' END AS role,
            p.updated_at
     FROM public.profiles p
     LEFT JOIN auth.users au ON au.id = p.id
     ORDER BY p.updated_at DESC`
  );

  const users: User[] = result.rows.map((row: any) => ({
    id: row.id,
    email: row.email || '',
    displayName: row.display_name,
    role: row.role as 'admin' | 'user',
    createdAt: new Date(row.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
  }));

  return createElement(
    'div',
    { className: 'p-6 space-y-6' },
    createElement('h1', { className: 'text-3xl font-bold text-text' }, 'Users'),
    createElement(UserGrid, { users, currentUserId: session.user.id })
  );
}
