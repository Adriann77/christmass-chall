import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { getUserById } from '@/lib/auth';

export async function POST(request: Request) {
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

  try {
    const { date } = await request.json();

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const taskDate = new Date(date);
    
    // Check if task already exists
    const existingTask = await prisma.dailyTask.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: taskDate,
        },
      },
    });

    if (existingTask) {
      return NextResponse.json({ task: existingTask });
    }

    // Create new task
    // Also fetch active templates to create completions
    const templates = await prisma.taskTemplate.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
    });

    const newTask = await prisma.dailyTask.create({
      data: {
        userId: user.id,
        date: taskDate,
        taskCompletions: {
          create: templates.map((template) => ({
            taskTemplateId: template.id,
            completed: false,
          })),
        },
      },
      include: {
        taskCompletions: true,
      },
    });

    return NextResponse.json({ task: newTask });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
