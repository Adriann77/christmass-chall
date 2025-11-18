import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
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
    const { amount, category, description } = body;

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

    // Update the spending
    const updatedSpending = await prisma.spending.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(category !== undefined && { category }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json({ spending: updatedSpending });
  } catch (error) {
    console.error('Error updating spending:', error);
    return NextResponse.json(
      { error: 'Failed to update spending' },
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
