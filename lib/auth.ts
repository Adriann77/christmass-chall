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

    // Create the user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
      },
    });

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
    return { success: false, error: 'Failed to create account' };
  }
}

export async function getUserById(id: string): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}
