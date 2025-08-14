import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    console.log('Seeding database with default category...');

    const generalCategory = await prisma.category.upsert({
      where: { id: 'cl_general_category_01' }, // hardcoded id for predictability
      update: {},
      create: {
        id: 'cl_general_category_01',
        name: 'General',
        isSystem: true,
      },
    });

    console.log('Seeding finished.');
    return NextResponse.json({ message: 'Database seeded successfully', category: generalCategory });

  } catch (error) {
    console.error('Seeding failed:', error);
    return NextResponse.json({ message: 'Database seeding failed' }, { status: 500 });
  }
}
