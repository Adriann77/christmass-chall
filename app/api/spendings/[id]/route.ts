import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

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

    // Find the spending and verify ownership
    const spending = await prisma.spending.findUnique({
      where: { id },
    });

    if (!spending || spending.userId !== session.userId) {
      return NextResponse.json(
        { error: 'Spending not found or unauthorized' },
        { status: 404 },
      );
    }

    // Delete the spending
    await prisma.spending.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Spending deleted successfully' });
  } catch (error) {
    console.error('Error deleting spending:', error);
    return NextResponse.json(
      { error: 'Failed to delete spending' },
      { status: 500 },
    );
  }
}
