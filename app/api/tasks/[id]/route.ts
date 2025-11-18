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
        water: body.water ?? task.water,
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

export async function DELETE(
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

    // Find the daily task and verify ownership
    const dailyTask = await prisma.dailyTask.findUnique({
      where: { id },
    });

    if (!dailyTask || dailyTask.userId !== session.userId) {
      return NextResponse.json(
        { error: 'Task not found or unauthorized' },
        { status: 404 },
      );
    }

    // Delete the daily task (cascade will delete related data)
    await prisma.dailyTask.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Daily task deleted successfully' });
  } catch (error) {
    console.error('Error deleting daily task:', error);
    return NextResponse.json(
      { error: 'Failed to delete daily task' },
      { status: 500 },
    );
  }
}
