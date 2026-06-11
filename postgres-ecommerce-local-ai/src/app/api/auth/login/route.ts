import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const userResult = await pool.query(
      `SELECT u.id, u.email, u.password_hash, p.display_name
       FROM auth.users u
       LEFT JOIN public.profiles p ON p.id = u.id
       WHERE u.email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = userResult.rows[0];

    if (!user.password_hash) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const sessionResult = await pool.query(
      `INSERT INTO auth.sessions (user_id)
       VALUES ($1)
       RETURNING token`,
      [user.id]
    );

    const token = sessionResult.rows[0].token;

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name || user.email,
      },
    });

    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Invalid email or password' },
      { status: 401 }
    );
  }
}
