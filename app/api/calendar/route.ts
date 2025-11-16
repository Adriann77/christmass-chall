import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);

    // Get all tasks for December 2025
    const tasks = await prisma.dailyTask.findMany({
      where: {
        userId: session.userId,
      },
      orderBy: {
        date: 'asc',
      },
      include: {
        spendings: true,
      },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Get calendar error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
