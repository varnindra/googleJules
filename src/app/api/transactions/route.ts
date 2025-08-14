import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { TransactionType } from '@prisma/client';

// GET: List all transactions for a family
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const familyGroupId = searchParams.get('familyGroupId');

  if (!familyGroupId) {
    return NextResponse.json({ message: 'familyGroupId is required' }, { status: 400 });
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        familyGroupId: familyGroupId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }, // Select user fields to return
        },
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return NextResponse.json({ message: 'Failed to fetch transactions' }, { status: 500 });
  }
}


// POST: Create a new transaction
export async function POST(request: Request) {
  try {
    const { amount, date, userId, categoryId, description, type } = await request.json();

    // Basic validation
    if (!amount || !date || !userId || !categoryId || !type) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    if (!Object.values(TransactionType).includes(type)) {
      return NextResponse.json({ message: 'Invalid transaction type' }, { status: 400 });
    }

    // Verify user exists and get their family group
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.familyGroupId) {
      return NextResponse.json({ message: 'User not found or not in a family group' }, { status: 404 });
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
        where: { id: categoryId }
    });

    if (!category) {
        return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    const newTransaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        date: new Date(date),
        description,
        type,
        userId,
        categoryId,
        familyGroupId: user.familyGroupId,
      },
    });

    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error('Failed to create transaction:', error);
    return NextResponse.json({ message: 'Failed to create transaction' }, { status: 500 });
  }
}
