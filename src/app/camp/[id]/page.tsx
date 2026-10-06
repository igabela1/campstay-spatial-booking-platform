import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CampLayoutMap } from '@/components/camp-layout-map';

type CampPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatType(type: string) {
  return type
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default async function CampPage({ params }: CampPageProps) {
  const { id } = await params;

  const camp = await prisma.camp.findUnique({
    where: { id },
    include: {
      listings: {
        where: {
          status: 'APPROVED',
        },
        orderBy: {
          createdAt: 'asc',
        },
        include: {
          photos: true,
        },
      },
    },
  });

  if (!camp) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="container mx-auto flex-1 px-4 py-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{camp.name}</h1>
          <p className="mt-2 text-muted-foreground">
            {camp.city}, {camp.address}
          </p>
          {camp.description && (
            <p className="mt-4 text-muted-foreground">{camp.description}</p>
          )}
        </div>

        {camp.mapImageUrl && (
          <CampLayoutMap
            imageUrl={camp.mapImageUrl}
            listings={camp.listings.map((listing) => ({
              id: listing.id,
              title: listing.title,
              type: listing.type,
              mapX: listing.mapX,
              mapY: listing.mapY,
              isAvailable: listing.isAvailable,
            }))}
          />
        )}

        <div className="mt-10">
          <h2 className="text-2xl font-semibold">Accommodation Units</h2>

          {camp.listings.length === 0 ? (
            <p className="mt-4 text-muted-foreground">
              No accommodation units available yet.
            </p>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {camp.listings.map((listing) => {
                const mainImage = listing.photos?.[0]?.url ?? '/placeholder.jpg';

                return (
                  <Link
                    key={listing.id}
                    href={`/listing/${listing.id}`}
                    className="rounded-xl border p-4 transition hover:border-primary hover:shadow-sm"
                  >
                    <img
                      src={mainImage}
                      alt={listing.title}
                      className="mb-3 h-48 w-full rounded-lg object-cover"
                    />

                    <h3 className="font-semibold">{listing.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatType(listing.type)}
                    </p>
                    <p className="text-sm">Capacity: {listing.capacity}</p>
                    <p className="text-sm">Price: {listing.price} KM</p>
                    <p className="text-sm">
                      {listing.isAvailable ? 'Available' : 'Unavailable'}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}