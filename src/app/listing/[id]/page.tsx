import Link from "next/link";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import { Footer } from "@/components/footer";
import { BookmarkButton } from "@/components/bookmark-button";
import { ReservationForm } from "@/components/reservation-form";
import { NearbyAttractions } from "@/components/nearby-attractions";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ListingLocationMap = dynamic(
  () => import("@/components/listing-location-map")
);

type ListingPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatType(type: string) {
  return type
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

function formatValue(
  value?: string | null
) {
  if (!value) return "-";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (char) => char.toUpperCase()
    );
}

export default async function ListingPage({
  params,
}: ListingPageProps) {
  const { id } = await params;

  const listing =
    await prisma.listing.findUnique({
      where: {
        id,
      },

      include: {
        provider: true,
        photos: true,
        camp: true,
      },
    });

  if (!listing) {
    notFound();
  }

  const mainImage =
    listing.photos.find(
      (photo) => photo.isCover
    )?.url ??
    listing.photos[0]?.url ??
    listing.image ??
    "/placeholder.jpg";

  /*
   * Prefer exact accommodation coordinates.
   * Use camp coordinates only as fallback.
   */
  const latitude =
    listing.lat ??
    listing.camp?.lat ??
    null;

  const longitude =
    listing.lng ??
    listing.camp?.lng ??
    null;

  const hasGeographicLocation =
    latitude !== null &&
    longitude !== null;

  const googleMapsHref =
    hasGeographicLocation
      ? `https://www.google.com/maps?q=${latitude},${longitude}`
      : null;

  return (
    <div className="flex min-h-screen flex-col">
      <main className="container mx-auto flex-1 px-4 py-24">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2">
            {/* TITLE */}

            <div className="mb-6">
              <h1 className="text-3xl font-bold">
                {listing.title}
              </h1>

              <p className="mt-2 text-muted-foreground">
                {listing.city},{" "}
                {listing.address}
              </p>

              {listing.camp && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Camp:{" "}
                  {listing.camp.name}
                </p>
              )}
            </div>

            {/* ACCOMMODATION DETAILS */}

            <Card>
              <CardHeader>
                <CardTitle>
                  Accommodation Details
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-8">
                {/* MAIN IMAGE */}

                <img
                  src={mainImage}
                  alt={listing.title}
                  className="h-72 w-full rounded-lg object-cover sm:h-96"
                />

                {/* DESCRIPTION */}

                <div>
                  <h2 className="text-lg font-semibold">
                    Description
                  </h2>

                  <p className="mt-2 text-muted-foreground">
                    {listing.description}
                  </p>
                </div>

                {/* BASIC INFO */}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="font-semibold">
                      Type
                    </h3>

                    <p className="text-muted-foreground">
                      {formatType(
                        listing.type
                      )}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      Capacity
                    </h3>

                    <p className="text-muted-foreground">
                      {listing.capacity}{" "}
                      guests
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      Price
                    </h3>

                    <p className="text-muted-foreground">
                      {listing.price} KM
                      / night
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      Availability
                    </h3>

                    <p className="text-muted-foreground">
                      {listing.isAvailable
                        ? "Available"
                        : "Unavailable"}
                    </p>
                  </div>
                </div>

                {/* GEOGRAPHIC LOCATION */}

                {hasGeographicLocation && (
                  <div className="space-y-4 rounded-2xl border border-slate-700 bg-slate-950/40 p-5">
                    <div>
                      <h2 className="text-xl font-semibold">
                        📍 Geographic
                        Location
                      </h2>

                      <p className="mt-1 text-sm text-muted-foreground">
                        This map shows
                        the geographic
                        position of this
                        accommodation
                        inside the camp.
                      </p>
                    </div>

                    <ListingLocationMap
                      latitude={latitude}
                      longitude={longitude}
                      title={
                        listing.title
                      }
                    />

                    {/* DISTANCES */}

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                        <p className="text-sm text-slate-400">
                          🏖 Beach
                        </p>

                        <p className="mt-1 text-xl font-bold">
                          {listing.distanceToBeach !==
                          null
                            ? `${listing.distanceToBeach} m`
                            : "-"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                        <p className="text-sm text-slate-400">
                          🚻 Toilet
                        </p>

                        <p className="mt-1 text-xl font-bold">
                          {listing.distanceToToilet !==
                          null
                            ? `${listing.distanceToToilet} m`
                            : "-"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                        <p className="text-sm text-slate-400">
                          🅿 Parking
                        </p>

                        <p className="mt-1 text-xl font-bold">
                          {listing.distanceToParking !==
                          null
                            ? `${listing.distanceToParking} m`
                            : "-"}
                        </p>
                      </div>
                    </div>

                    {googleMapsHref && (
                      <a
                        href={
                          googleMapsHref
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-sm font-medium text-primary underline"
                      >
                        Open exact
                        location in
                        Google Maps
                      </a>
                    )}
                  </div>
                )}

                {/* SPATIAL DETAILS */}

                <div className="rounded-2xl border border-slate-700 bg-slate-950/40 p-5">
                  <h2 className="mb-4 text-xl font-semibold">
                    Spatial Details
                  </h2>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Zone
                      </p>

                      <p className="font-medium">
                        {formatValue(
                          listing.spatialZone
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Best for
                      </p>

                      <p className="font-medium">
                        {formatValue(
                          listing.recommendedFor
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Shade
                      </p>

                      <p className="font-medium">
                        {listing.shadeLevel !==
                        null
                          ? `${listing.shadeLevel}%`
                          : "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Noise level
                      </p>

                      <p className="font-medium">
                        {listing.noiseLevel !==
                        null
                          ? `${listing.noiseLevel}/10`
                          : "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Terrain slope
                      </p>

                      <p className="font-medium">
                        {listing.terrainSlope !==
                        null
                          ? listing.terrainSlope
                          : "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Beach distance
                      </p>

                      <p className="font-medium">
                        {listing.distanceToBeach !==
                        null
                          ? `${listing.distanceToBeach} m`
                          : "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Toilet distance
                      </p>

                      <p className="font-medium">
                        {listing.distanceToToilet !==
                        null
                          ? `${listing.distanceToToilet} m`
                          : "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Parking distance
                      </p>

                      <p className="font-medium">
                        {listing.distanceToParking !==
                        null
                          ? `${listing.distanceToParking} m`
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* WHY THIS LOCATION */}

                <div className="rounded-2xl border border-emerald-800 bg-emerald-950/20 p-5">
                  <h2 className="mb-4 text-xl font-semibold">
                    Why this
                    location?
                  </h2>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    {listing.distanceToBeach !==
                      null && (
                      <p>
                        ✓ Beach is{" "}
                        <strong className="text-foreground">
                          {
                            listing.distanceToBeach
                          }{" "}
                          m
                        </strong>{" "}
                        from this
                        accommodation.
                      </p>
                    )}

                    {listing.distanceToToilet !==
                      null && (
                      <p>
                        ✓ Toilet
                        facilities are{" "}
                        <strong className="text-foreground">
                          {
                            listing.distanceToToilet
                          }{" "}
                          m
                        </strong>{" "}
                        away.
                      </p>
                    )}

                    {listing.distanceToParking !==
                      null && (
                      <p>
                        ✓ Parking is{" "}
                        <strong className="text-foreground">
                          {
                            listing.distanceToParking
                          }{" "}
                          m
                        </strong>{" "}
                        away.
                      </p>
                    )}

                    {listing.noiseLevel !==
                      null && (
                      <p>
                        ✓ Noise level:
                        {" "}
                        <strong className="text-foreground">
                          {
                            listing.noiseLevel
                          }
                          /10
                        </strong>
                        .
                      </p>
                    )}

                    {listing.shadeLevel !==
                      null && (
                      <p>
                        ✓ Shade level:
                        {" "}
                        <strong className="text-foreground">
                          {
                            listing.shadeLevel
                          }
                          %
                        </strong>
                        .
                      </p>
                    )}

                    {listing.recommendedFor && (
                      <p>
                        ✓ Recommended
                        for{" "}
                        <strong className="text-foreground">
                          {formatValue(
                            listing.recommendedFor
                          )}
                        </strong>
                        .
                      </p>
                    )}
                  </div>
                </div>

                {/* MORE PHOTOS */}

                {listing.photos.length >
                  1 && (
                  <div>
                    <h2 className="text-lg font-semibold">
                      More Photos
                    </h2>

                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      {listing.photos
                        .slice(1)
                        .map(
                          (
                            photo
                          ) => (
                            <img
                              key={
                                photo.id
                              }
                              src={
                                photo.url
                              }
                              alt={
                                listing.title
                              }
                              className="h-56 w-full rounded-lg object-cover"
                            />
                          )
                        )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDE */}

          <div>
            <Card>
              <CardHeader>
                <CardTitle>
                  Reservation
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <p className="text-2xl font-bold">
                    {listing.price} KM
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Per night
                  </p>
                </div>

                <ReservationForm
                  listingId={
                    listing.id
                  }
                />

                <BookmarkButton
                  listingId={
                    listing.id
                  }
                />

                {/* PROVIDER */}

                <div className="border-t pt-4">
                  <h3 className="font-semibold">
                    Provider
                  </h3>

                  <p className="mt-2 text-muted-foreground">
                    {listing.provider
                      .name ??
                      "Camp provider"}
                  </p>

                  {listing.provider
                    .email && (
                    <p className="text-sm text-muted-foreground">
                      {
                        listing
                          .provider
                          .email
                      }
                    </p>
                  )}
                </div>

                {/* CAMP MAP */}

                {listing.campId && (
                  <Link
                    href={`/camp/${listing.campId}`}
                    className="block rounded-lg border px-4 py-2 text-center text-sm hover:bg-muted"
                  >
                    Open full camp
                    map
                  </Link>
                )}

                {/* GOOGLE MAPS */}

                {googleMapsHref && (
                  <a
                    href={
                      googleMapsHref
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg border px-4 py-2 text-center text-sm hover:bg-muted"
                  >
                    Open exact
                    location in
                    Google Maps
                  </a>
                )}

                {/* FAVORITES */}

                <Link
                  href="/my-favorites"
                  className="block rounded-lg border px-4 py-2 text-center text-sm hover:bg-muted"
                >
                  Open my
                  favorites
                </Link>
              </CardContent>
            </Card>

            <NearbyAttractions
              listingId={
                listing.id
              }
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}