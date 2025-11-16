import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
}

export async function loginUser(
  username: string,
  password: string
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
