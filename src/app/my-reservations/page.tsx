import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default async function MyReservationsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login');
  }

  let dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        email: session.user.email,
        name: session.user.name || 'User',
      },
    });
  }

  const reservations = await prisma.reservation.findMany({
    where: {
      userId: dbUser.id,
    },
    include: {
      listing: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="container mx-auto flex-1 px-4 py-24">
        <h1 className="text-3xl font-bold">My Reservations</h1>

        {reservations.length === 0 ? (
          <p className="mt-6 text-muted-foreground">
            You have no reservations yet.
          </p>
        ) : (
          <div className="mt-8 grid gap-4">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="rounded-xl border p-5 shadow-sm"
              >
                <h2 className="text-xl font-semibold">
                  {reservation.listing.title}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {reservation.listing.city}
                </p>

                <div className="mt-4 space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Check-in:</span>{' '}
                    {new Date(reservation.checkIn).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Check-out:</span>{' '}
                    {new Date(reservation.checkOut).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Guests:</span>{' '}
                    {reservation.guests}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{' '}
                    {reservation.status}
                  </p>
                </div>

                <Link
                  href={`/listing/${reservation.listing.id}`}
                  className="mt-4 inline-block text-sm text-blue-500 hover:underline"
                >
                  View listing
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}