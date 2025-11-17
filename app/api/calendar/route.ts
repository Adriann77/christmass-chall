import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);

    // Get month and year from query params, default to current month
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');

    const now = new Date();
    const month = monthParam ? parseInt(monthParam) : now.getMonth();
    const year = yearParam ? parseInt(yearParam) : now.getFullYear();

    // Get first and last day of the specified month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0, 23, 59, 59, 999);

    // Get all tasks for the specified month
    const tasks = await prisma.dailyTask.findMany({
      where: {
        userId: session.userId,
        date: {
          gte: firstDay,
          lte: lastDay,
        },
      },
      orderBy: {
        date: 'asc',
      },
      include: {
        spendings: true,
        taskCompletions: {
          include: {
            taskTemplate: true,
          },
          orderBy: {
            taskTemplate: {
              sortOrder: 'asc',
            },
          },
        },
      },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Get calendar error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
