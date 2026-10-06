import { prisma } from "@/lib/prisma";
import { MapPageClient } from "@/components/map-page-client";

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{
    listingId?: string;
  }>;
}) {
  const { listingId } = await searchParams;

  const listings =
    await prisma.listing.findMany({
      where: {
        status: "APPROVED",
      },

      select: {
        id: true,
        title: true,
        type: true,

        lat: true,
        lng: true,

        mapX: true,
        mapY: true,

        image: true,
        price: true,

        campId: true,

        spatialZone: true,

        distanceToToilet: true,
        distanceToBeach: true,
        distanceToParking: true,

        shadeLevel: true,
        terrainSlope: true,
        noiseLevel: true,
        recommendedFor: true,

        camp: {
          select: {
            id: true,
            name: true,
            lat: true,
            lng: true,
            mapImageUrl: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  const pointsOfInterest =
    await prisma.campPointOfInterest.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        lat: true,
        lng: true,
        campId: true,
      },

      orderBy: {
        type: "asc",
      },
    });

  return (
    <main className="min-h-screen bg-slate-950">
      <MapPageClient
        listings={listings}
        pointsOfInterest={
          pointsOfInterest
        }
        selectedListingId={
          listingId ?? null
        }
      />
    </main>
  );
}