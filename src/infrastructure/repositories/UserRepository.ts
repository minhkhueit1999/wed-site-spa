import { prisma } from '@/infrastructure/db/prisma';
import bcrypt from 'bcryptjs';

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role?: 'CUSTOMER' | 'THERAPIST' | 'ADMIN';
  consent?: boolean;
}

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { profile: true },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  async createUser(input: CreateUserInput) {
    const passwordHash = await bcrypt.hash(input.password, 10);
    const normalizedEmail = input.email.toLowerCase().trim();

    return prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: input.name.trim(),
        role: input.role || 'CUSTOMER',
        ...(input.role === 'CUSTOMER' || !input.role
          ? {
              profile: {
                create: {
                  safetyFlags: '[]',
                  consentAt: input.consent ? new Date() : null,
                },
              },
            }
          : {}),
      },
      include: { profile: true },
    });
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

export const userRepository = new UserRepository();
