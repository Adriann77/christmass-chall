import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getUserById } from '@/lib/auth';

// PATCH /api/task-completions/[id] - Update task completion status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionData = JSON.parse(sessionCookie.value);
    const user = await getUserById(sessionData.userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { completed } = body;

    // Verify completion belongs to user via dailyTask
    const taskCompletion = await prisma.taskCompletion.findUnique({
      where: { id },
      include: {
        dailyTask: true,
      },
    });

    if (!taskCompletion || taskCompletion.dailyTask.userId !== user.id) {
      return NextResponse.json(
        { error: 'Task completion not found' },
        { status: 404 },
      );
    }

    const updatedCompletion = await prisma.taskCompletion.update({
      where: { id },
      data: {
        completed: completed ?? taskCompletion.completed,
      },
    });

    return NextResponse.json(updatedCompletion);
  } catch (error) {
    console.error('Error updating task completion:', error);
    return NextResponse.json(
      { error: 'Failed to update task completion' },
      { status: 500 },
    );
  }
}
