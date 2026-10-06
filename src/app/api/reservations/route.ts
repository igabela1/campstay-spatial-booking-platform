import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'You must be logged in.' },
        { status: 401 }
      );
    }

    let dbUser = await prisma.user.findUnique({
  where: { email: session.user.email },
});

if (!dbUser) {
  dbUser = await prisma.user.create({
    data: {
      email: session.user.email!,
      name: session.user.name || 'User',
    },
  });
}

    const body = await req.json();
    const { listingId, checkIn, checkOut, guests, note } = body;

    console.log('BODY:', body);
    console.log('SESSION EMAIL:', session.user.email);
    console.log('DB USER ID:', dbUser.id);
    console.log('LISTING ID:', listingId);

    if (!listingId || !checkIn || !checkOut || !guests) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields.' },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { success: false, message: 'Listing not found.' },
        { status: 404 }
      );
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json(
        { success: false, message: 'Invalid date format.' },
        { status: 400 }
      );
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { success: false, message: 'Check-out must be after check-in.' },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.create({
      data: {
        userId: dbUser.id,
        listingId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: Number(guests),
        status: 'PENDING',
        note: note || null,
      },
    });

    return NextResponse.json({ success: true, reservation }, { status: 201 });
  } catch (error) {
    console.error('Reservation create error:', error);

    return NextResponse.json(
      { success: false, message: 'Failed to create reservation.' },
      { status: 500 }
    );
  }
}