import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
}

export async function loginUser(
  username: string,
  password: string,
): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      name: user.name,
    };
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

export async function registerUser(
  username: string,
  password: string,
  name: string,
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return { success: false, error: 'Username already exists' };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user with challenge start date as today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        challengeStartDate: today,
      },
    });

    // Create default task templates for new user
    const defaultTasks = [
      { name: '10 000 kroków', icon: 'TrendingUp', sortOrder: 1 },
      { name: 'Trening/Rozciąganie', icon: 'Dumbbell', sortOrder: 2 },
      { name: 'Zdrowa dieta', icon: 'Apple', sortOrder: 3 },
      { name: 'Czytanie książki', icon: 'Book', sortOrder: 4 },
      { name: 'Nauka (1 godzina)', icon: 'GraduationCap', sortOrder: 5 },
      { name: '2.5 litra wody', icon: 'Droplet', sortOrder: 6 },
    ];

    for (const task of defaultTasks) {
      await prisma.taskTemplate.create({
        data: {
          userId: user.id,
          name: task.name,
          icon: task.icon,
          sortOrder: task.sortOrder,
        },
      });
    }

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
      },
    };
  } catch (error) {
    console.error('Registration error:', error);
    // Log more details about database errors
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error name:', error.name);
      // Check for common Prisma errors
      if (error.message.includes('P2002')) {
        return { success: false, error: 'Username already exists' };
      }
      if (error.message.includes('connect') || error.message.includes('connection')) {
        console.error('Database connection error detected');
        return { success: false, error: 'Database connection failed. Please check your database configuration.' };
      }
    }
    return { success: false, error: 'Failed to create account' };
  }
}

export async function getUserById(id: string): Promise<any | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        challengeStartDate: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}
