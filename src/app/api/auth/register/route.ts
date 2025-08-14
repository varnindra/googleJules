import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
        return NextResponse.json({ message: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if a family group exists.
    const familyGroupCount = await prisma.familyGroup.count();

    let user;

    if (familyGroupCount === 0) {
      // This is the first user, create a new family group and make them the owner.
      const newFamilyGroup = await prisma.familyGroup.create({
        data: {
          name: `${name || email}'s Family`,
        },
      });

      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          isFamilyOwner: true,
          familyGroupId: newFamilyGroup.id,
        },
      });
    } else {
      // A family group already exists. For now, we block registration.
      // In the future, this would be an invitation-only flow.
      return NextResponse.json({ message: 'Registration is currently closed. Please ask the family owner for an invitation.' }, { status: 403 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
