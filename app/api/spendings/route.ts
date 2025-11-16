import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const { dailyTaskId, amount, category, description } = await request.json();

    // Verify the task belongs to the user
    const task = await prisma.dailyTask.findUnique({
      where: { id: dailyTaskId },
    });

    if (!task || task.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const spending = await prisma.spending.create({
      data: {
        userId: session.userId,
        dailyTaskId,
        amount: parseFloat(amount),
        category,
        description,
      },
    });

    return NextResponse.json({ spending });
  } catch (error) {
    console.error('Create spending error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);

    const now = new Date();
    const currentDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    currentDate.setHours(0, 0, 0, 0);

    const task = await prisma.dailyTask.findUnique({
      where: {
        userId_date: {
          userId: session.userId,
          date: currentDate,
        },
      },
    });

    if (!task) {
      return NextResponse.json({ spendings: [] });
    }

    const spendings = await prisma.spending.findMany({
      where: {
        dailyTaskId: task.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ spendings });
  } catch (error) {
    console.error('Get spendings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
