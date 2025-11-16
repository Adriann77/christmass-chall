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

    // Get current date - use actual date for the challenge
    const now = new Date();
    const currentDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    currentDate.setHours(0, 0, 0, 0);

    const dailyTask = await prisma.dailyTask.findUnique({
      where: {
        userId_date: {
          userId: session.userId,
          date: currentDate,
        },
      },
      include: {
        spendings: true,
      },
    });

    if (!dailyTask) {
      // Create if doesn't exist
      const newTask = await prisma.dailyTask.create({
        data: {
          userId: session.userId,
          date: currentDate,
        },
        include: {
          spendings: true,
        },
      });
      return NextResponse.json({ task: newTask });
    }

    return NextResponse.json({ task: dailyTask });
  } catch (error) {
    console.error('Get today task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
