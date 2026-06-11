import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        displayName: session.user.displayName || session.user.email,
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
