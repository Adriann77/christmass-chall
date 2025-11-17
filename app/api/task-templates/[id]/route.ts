import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getUserById } from '@/lib/auth';

// PATCH /api/task-templates/[id] - Update task template
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

    // Verify template belongs to user
    const template = await prisma.taskTemplate.findUnique({
      where: { id },
    });

    if (!template || template.userId !== user.id) {
      return NextResponse.json(
        { error: 'Task template not found' },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { name, icon, sortOrder, isActive } = body;

    const updatedTemplate = await prisma.taskTemplate.update({
      where: { id },
      data: {
        name: name ?? template.name,
        icon: icon ?? template.icon,
        sortOrder: sortOrder ?? template.sortOrder,
        isActive: isActive ?? template.isActive,
      },
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating task template:', error);
    return NextResponse.json(
      { error: 'Failed to update task template' },
      { status: 500 },
    );
  }
}

// DELETE /api/task-templates/[id] - Delete task template
export async function DELETE(
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

    // Verify template belongs to user
    const template = await prisma.taskTemplate.findUnique({
      where: { id },
    });

    if (!template || template.userId !== user.id) {
      return NextResponse.json(
        { error: 'Task template not found' },
        { status: 404 },
      );
    }

    await prisma.taskTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Task template deleted' });
  } catch (error) {
    console.error('Error deleting task template:', error);
    return NextResponse.json(
      { error: 'Failed to delete task template' },
      { status: 500 },
    );
  }
}
