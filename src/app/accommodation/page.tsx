import { prisma } from "@/lib/prisma";
import { AccommodationCard } from "@/components/accommodation-card";

export default async function AccommodationPage() {
  const listings = await prisma.listing.findMany({
    where: {
      status: "APPROVED",
    },
    select: {
      id: true,
      title: true,
      city: true,
      address: true,
      price: true,

      spatialZone: true,
      distanceToToilet: true,
      distanceToBeach: true,
      shadeLevel: true,
      noiseLevel: true,
      recommendedFor: true,

      photos: {
        take: 1,
        select: {
          url: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedListings = listings.map((listing) => ({
    id: listing.id,
    title: listing.title,
    location: listing.city || listing.address || "Auto Kamp Miris Ljeta",
    price: listing.price,
    imageUrl: listing.photos[0]?.url || "/logo.jpg",

    spatialZone: listing.spatialZone,
    distanceToToilet: listing.distanceToToilet,
    distanceToBeach: listing.distanceToBeach,
    shadeLevel: listing.shadeLevel,
    noiseLevel: listing.noiseLevel,
    recommendedFor: listing.recommendedFor,
  }));

  return (
    <main className="min-h-screen px-8 pt-32 pb-12">
      <h1 className="mb-8 text-4xl font-bold">Accommodation</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {formattedListings.map((listing) => (
          <AccommodationCard key={listing.id} listing={listing} />
        ))}
      </div>
    </main>
  );
}