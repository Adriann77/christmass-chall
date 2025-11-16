import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const { id } = await context.params;
    const body = await request.json();

    // Verify the task belongs to the user
    const task = await prisma.dailyTask.findUnique({
      where: { id },
    });

    if (!task || task.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the task
    const updatedTask = await prisma.dailyTask.update({
      where: { id },
      data: {
        steps: body.steps ?? task.steps,
        training: body.training ?? task.training,
        diet: body.diet ?? task.diet,
        book: body.book ?? task.book,
        learning: body.learning ?? task.learning,
      },
      include: {
        spendings: true,
      },
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
