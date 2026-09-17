import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma, env } from '../config/index.js';
import { AppError } from '../middleware/index.js';

export class AuthService {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password.', 401);
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: (env.JWT_EXPIRES_IN || '24h') as any }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async getMe(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    return user;
  }
}

export const authService = new AuthService();
