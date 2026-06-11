import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const existing = await pool.query('SELECT id FROM auth.users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userResult = await pool.query(
      `INSERT INTO auth.users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email`,
      [email, passwordHash]
    );

    const user = userResult.rows[0];

    await pool.query(
      `INSERT INTO public.profiles (id, display_name, phone, avatar_url)
       VALUES ($1, $2, NULL, NULL)
       ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name`,
      [user.id, displayName || email.split('@')[0]]
    );

    const sessionResult = await pool.query(
      `INSERT INTO auth.sessions (user_id)
       VALUES ($1)
       RETURNING token`,
      [user.id]
    );

    const token = sessionResult.rows[0].token;

    const response = NextResponse.json(
      { user: { id: user.id, email: user.email, displayName: displayName || email.split('@')[0] } },
      { status: 201 }
    );

    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Registration failed' },
      { status: 500 }
    );
  }
}
