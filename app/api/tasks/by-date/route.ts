import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { getUserById } from '@/lib/auth';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = JSON.parse(sessionCookie.value);
  const user = await getUserById(session.userId);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');

  if (!dateParam) {
    return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
  }

  try {
    const date = new Date(dateParam);
    
    const task = await prisma.dailyTask.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: date,
        },
      },
      include: {
        taskCompletions: true,
        spendings: true,
      },
    });

    if (!task) {
      return NextResponse.json({ task: null });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error fetching task by date:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}
