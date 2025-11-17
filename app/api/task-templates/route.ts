import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getUserById } from '@/lib/auth';

// GET /api/task-templates - Get all task templates for current user
export async function GET() {
  try {
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

    const templates = await prisma.taskTemplate.findMany({
      where: { userId: user.id },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching task templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task templates' },
      { status: 500 },
    );
  }
}

// POST /api/task-templates - Create new task template
export async function POST(request: NextRequest) {
  try {
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
    const { name, icon, sortOrder, isActive } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 },
      );
    }

    const template = await prisma.taskTemplate.create({
      data: {
        userId: user.id,
        name,
        icon: icon || 'CheckCircle',
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating task template:', error);
    return NextResponse.json(
      { error: 'Failed to create task template' },
      { status: 500 },
    );
  }
}
