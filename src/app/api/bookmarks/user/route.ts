import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Missing email' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        bookmarks: {
          include: {
            listing: {
              include: {
                photos: true,
                camp: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ bookmarks: user.bookmarks });
  } catch (error) {
    console.error('GET /api/bookmarks/user error:', error);
    return NextResponse.json(
      { error: 'Failed to load favorites' },
      { status: 500 }
    );
  }
}