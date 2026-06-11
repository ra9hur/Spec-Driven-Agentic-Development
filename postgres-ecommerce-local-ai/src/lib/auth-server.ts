import 'server-only';
import { cookies } from 'next/headers';
import pool from '@/lib/db';

export interface ServerSession {
  user: {
    id: string;
    email: string;
    displayName?: string;
  };
}

export async function getServerSession(): Promise<ServerSession | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return null;

    const result = await pool.query(
      `SELECT u.id, u.email, p.display_name
       FROM auth.sessions s
       JOIN auth.users u ON u.id = s.user_id
       LEFT JOIN public.profiles p ON p.id = u.id
       WHERE s.token = $1::uuid AND s.expires_at > now()`,
      [token]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      user: {
        id: row.id,
        email: row.email,
        displayName: row.display_name || row.email,
      },
    };
  } catch {
    return null;
  }
}
