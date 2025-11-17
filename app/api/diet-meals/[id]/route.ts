import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getUserById } from '@/lib/auth';

// PATCH /api/diet-meals/[id] - Update diet meal
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

    // Verify meal belongs to user
    const meal = await prisma.dietMeal.findUnique({
      where: { id },
    });

    if (!meal || meal.userId !== user.id) {
      return NextResponse.json(
        { error: 'Diet meal not found' },
        { status: 404 },
      );
    }

    const body = await request.json();
    const {
      day,
      mealType,
      name,
      kcal,
      protein,
      fat,
      carbs,
      ingredients,
      sortOrder,
    } = body;

    const updatedMeal = await prisma.dietMeal.update({
      where: { id },
      data: {
        day: day !== undefined ? parseInt(day) : meal.day,
        mealType: mealType ?? meal.mealType,
        name: name ?? meal.name,
        kcal: kcal !== undefined ? parseFloat(kcal) : meal.kcal,
        protein: protein !== undefined ? parseFloat(protein) : meal.protein,
        fat: fat !== undefined ? parseFloat(fat) : meal.fat,
        carbs: carbs !== undefined ? parseFloat(carbs) : meal.carbs,
        ingredients: ingredients ?? meal.ingredients,
        sortOrder: sortOrder ?? meal.sortOrder,
      },
    });

    return NextResponse.json(updatedMeal);
  } catch (error) {
    console.error('Error updating diet meal:', error);
    return NextResponse.json(
      { error: 'Failed to update diet meal' },
      { status: 500 },
    );
  }
}

// DELETE /api/diet-meals/[id] - Delete diet meal
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

    // Verify meal belongs to user
    const meal = await prisma.dietMeal.findUnique({
      where: { id },
    });

    if (!meal || meal.userId !== user.id) {
      return NextResponse.json(
        { error: 'Diet meal not found' },
        { status: 404 },
      );
    }

    await prisma.dietMeal.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Diet meal deleted' });
  } catch (error) {
    console.error('Error deleting diet meal:', error);
    return NextResponse.json(
      { error: 'Failed to delete diet meal' },
      { status: 500 },
    );
  }
}
