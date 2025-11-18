import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { username, password, name } = await request.json();

    if (!username || !password || !name) {
      return NextResponse.json(
        { error: 'Username, password, and name are required' },
        { status: 400 },
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters long' },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 },
      );
    }

    const result = await registerUser(username, password, name);

    if (!result.success) {
      console.error('Registration failed:', result.error);
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('session', JSON.stringify({ userId: result.user!.id }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return NextResponse.json({ user: result.user });
  } catch (error) {
    console.error('Registration error:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { 
        error: 'Internal server error',
        // Include error details in development
        ...(process.env.NODE_ENV === 'development' && error instanceof Error && {
          details: error.message
        })
      },
      { status: 500 },
    );
  }
}
