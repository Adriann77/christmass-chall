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
    const { items } = await request.json();

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 },
      );
    }

    // Update each item's sortOrder
    // We use a transaction to ensure all updates succeed or fail together
    await prisma.$transaction(
      items.map((item: { id: string; sortOrder: number }) =>
        prisma.taskTemplate.update({
          where: {
            id: item.id,
            userId: session.userId, // Ensure user owns the template
          },
          data: {
            sortOrder: item.sortOrder,
          },
        }),
      ),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reorder error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
