import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getUserById } from '@/lib/auth';

// GET /api/diet-meals - Get all diet meals for current user
// Optional query param: day (1-7)
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const day = searchParams.get('day');

    const where: any = { userId: user.id };
    if (day) {
      where.day = parseInt(day);
    }

    const meals = await prisma.dietMeal.findMany({
      where,
      orderBy: [{ day: 'asc' }, { sortOrder: 'asc' }],
    });

    return NextResponse.json(meals);
  } catch (error) {
    console.error('Error fetching diet meals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch diet meals' },
      { status: 500 },
    );
  }
}

// POST /api/diet-meals - Create new diet meal
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

    if (!day || !mealType || !name) {
      return NextResponse.json(
        { error: 'Day, mealType, and name are required' },
        { status: 400 },
      );
    }

    const meal = await prisma.dietMeal.create({
      data: {
        userId: user.id,
        day: parseInt(day),
        mealType,
        name,
        kcal: parseFloat(kcal) || 0,
        protein: parseFloat(protein) || 0,
        fat: parseFloat(fat) || 0,
        carbs: parseFloat(carbs) || 0,
        ingredients: ingredients || '[]',
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json(meal, { status: 201 });
  } catch (error) {
    console.error('Error creating diet meal:', error);
    return NextResponse.json(
      { error: 'Failed to create diet meal' },
      { status: 500 },
    );
  }
}
