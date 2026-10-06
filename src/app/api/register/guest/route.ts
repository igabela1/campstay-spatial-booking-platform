import { NextResponse } from 'next/server';
import * as bcryptjs from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'All fields are required.' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'A user with this email already exists.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'GUEST' as any,
        status: 'APPROVED' as any,
      },
    });

    return NextResponse.json({
      message: 'User created successfully.',
      userId: user.id,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Something went wrong while creating the account.' },
      { status: 500 }
    );
  }
}