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

    // Get date from query params or use current date
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    let currentDate: Date;
    if (dateParam) {
      currentDate = new Date(dateParam);
    } else {
      const now = new Date();
      currentDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
    }
    currentDate.setHours(0, 0, 0, 0);

    let dailyTask = await prisma.dailyTask.findUnique({
      where: {
        userId_date: {
          userId: session.userId,
          date: currentDate,
        },
      },
      include: {
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

    if (!dailyTask) {
      // Create if doesn't exist
      dailyTask = await prisma.dailyTask.create({
        data: {
          userId: session.userId,
          date: currentDate,
        },
        include: {
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
    }

    // Get all active task templates for user
    const taskTemplates = await prisma.taskTemplate.findMany({
      where: {
        userId: session.userId,
        isActive: true,
      },
    });

    // Check if we need to create missing task completions
    const existingCompletionTemplateIds = dailyTask.taskCompletions.map(
      (tc) => tc.taskTemplateId,
    );

    const missingTemplates = taskTemplates.filter(
      (template) => !existingCompletionTemplateIds.includes(template.id),
    );

    // Create task completions for missing templates
    if (missingTemplates.length > 0) {
      await prisma.taskCompletion.createMany({
        data: missingTemplates.map((template) => ({
          dailyTaskId: dailyTask!.id,
          taskTemplateId: template.id,
          completed: false,
        })),
      });

      // Refetch with all completions
      dailyTask = await prisma.dailyTask.findUnique({
        where: { id: dailyTask.id },
        include: {
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
