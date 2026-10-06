import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest) {
  const token = await getToken({ req });

  if (!token?.email) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  const body = await req.json();

  const updatedUser = await prisma.user.update({
    where: {
      email: token.email,
    },
    data: {
      name: body.name,
      email: body.email,
    },
  });

  return NextResponse.json(updatedUser);
}