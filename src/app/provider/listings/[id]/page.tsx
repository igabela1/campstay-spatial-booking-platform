import Link from "next/link";
import { notFound } from "next/navigation";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { prisma } from "@/lib/prisma";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ReservationForm } from "@/components/reservation-form";
import { BookmarkButton } from "@/components/bookmark-button";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function formatValue(value?: string | null) {
  if (!value) return "-";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getMarkerLabel(type?: string | null) {
  switch (type) {
    case "TENT_PITCH":
      return "T";

    case "CAMPER_PITCH":
      return "C";

    case "BUNGALOW":
      return "B";

    case "APARTMENT":
      return "A";

    case "POOL_COTTAGE":
      return "P";

    default:
      return "•";
  }
}

export default async function ListingPage({ params }: Props) {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
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

  const coverPhoto =
    listing.photos.find((photo) => photo.isCover)?.url ??
    listing.photos[0]?.url ??
    listing.image ??
    null;

  const campMapImage =
    listing.camp?.mapImageUrl ?? null;

  const hasCampMapPosition =
    Boolean(campMapImage) &&
    listing.mapX !== null &&
    listing.mapY !== null;

  const latitude =
    listing.lat ??
    listing.camp?.lat ??
    null;

  const longitude =
    listing.lng ??
    listing.camp?.lng ??
    null;

  const googleMapsHref =
    latitude !== null && longitude !== null
      ? `https://www.google.com/maps?q=${latitude},${longitude}`
      : null;

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <Header />

      <main className="flex-1 px-4 pb-10 pt-24 sm:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-7xl">
          {/* PAGE TITLE */}
          <div className="mb-6">
            <h1 className="break-words text-2xl font-bold sm:text-3xl lg:text-4xl">
              {listing.title}
            </h1>

            <p className="mt-2 text-sm text-slate-300 sm:text-base">
              {listing.city}, {listing.address}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
            {/* LEFT SIDE */}
            <div className="min-w-0">
              <Card className="border-slate-800 bg-slate-900 text-white">
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl">
                    Accommodation Details
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* IMAGE */}
                  {coverPhoto && (
                    <div className="relative h-56 w-full overflow-hidden rounded-xl sm:h-80 lg:h-[420px]">
                      <img
                        src={coverPhoto}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  {/* DESCRIPTION */}
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">
                      Description
                    </h3>

                    <p className="break-words text-sm text-slate-300 sm:text-base">
                      {listing.description || "No description available."}
                    </p>
                  </div>

                  {/* BASIC DETAILS */}
                  <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 sm:text-base">
                    <p>
                      <b>Type:</b> {formatValue(listing.type)}
                    </p>

                    <p>
                      <b>Capacity:</b> {listing.capacity} guests
                    </p>

                    <p>
                      <b>Price:</b> {listing.price} KM / night
                    </p>

                    <p>
                      <b>Availability:</b>{" "}
                      {listing.isAvailable
                        ? "Available"
                        : "Not available"}
                    </p>
                  </div>

                  {/* SPATIAL DETAILS */}
                  <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4 sm:p-5">
                    <h3 className="mb-4 text-lg font-semibold sm:text-xl">
                      Spatial Details
                    </h3>

                    <div className="grid grid-cols-1 gap-3 text-sm text-slate-300 sm:grid-cols-2">
                      <p>
                        📍{" "}
                        <b className="text-white">
                          Zone:
                        </b>{" "}
                        {formatValue(listing.spatialZone)}
                      </p>

                      <p>
                        🚻{" "}
                        <b className="text-white">
                          Toilet:
                        </b>{" "}
                        {listing.distanceToToilet !== null
                          ? `${listing.distanceToToilet} m`
                          : "-"}
                      </p>

                      <p>
                        🏖️{" "}
                        <b className="text-white">
                          Beach:
                        </b>{" "}
                        {listing.distanceToBeach !== null
                          ? `${listing.distanceToBeach} m`
                          : "-"}
                      </p>

                      <p>
                        🅿️{" "}
                        <b className="text-white">
                          Parking:
                        </b>{" "}
                        {listing.distanceToParking !== null
                          ? `${listing.distanceToParking} m`
                          : "-"}
                      </p>

                      <p>
                        🌳{" "}
                        <b className="text-white">
                          Shade:
                        </b>{" "}
                        {listing.shadeLevel !== null
                          ? `${listing.shadeLevel}%`
                          : "-"}
                      </p>

                      <p>
                        ⛰️{" "}
                        <b className="text-white">
                          Terrain slope:
                        </b>{" "}
                        {listing.terrainSlope !== null
                          ? listing.terrainSlope
                          : "-"}
                      </p>

                      <p>
                        🔊{" "}
                        <b className="text-white">
                          Noise:
                        </b>{" "}
                        {listing.noiseLevel !== null
                          ? `${listing.noiseLevel}/10`
                          : "-"}
                      </p>

                      <p>
                        👤{" "}
                        <b className="text-white">
                          Best for:
                        </b>{" "}
                        {formatValue(listing.recommendedFor)}
                      </p>
                    </div>
                  </div>

                  {/* CAMP MAP */}
                  {hasCampMapPosition &&
                    campMapImage &&
                    listing.mapX !== null &&
                    listing.mapY !== null && (
                      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4 sm:p-5">
                        <h3 className="mb-2 text-lg font-semibold sm:text-xl">
                          Location on Camp Map
                        </h3>

                        <p className="mb-4 text-sm text-slate-300">
                          This map shows the exact position of the
                          accommodation inside the camp using spatial
                          coordinates.
                        </p>

                        <div className="relative overflow-hidden rounded-xl border border-slate-700">
                          <img
                            src={campMapImage}
                            alt={`${listing.camp?.name ?? "Camp"} map`}
                            className="w-full object-cover"
                          />

                          <div
                            className="absolute flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-red-600 text-sm font-bold text-white shadow-lg"
                            style={{
                              left: `${listing.mapX}%`,
                              top: `${listing.mapY}%`,
                              transform:
                                "translate(-50%, -50%)",
                            }}
                            title={listing.title}
                          >
                            {getMarkerLabel(listing.type)}
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
                          <span className="rounded-full bg-slate-700 px-3 py-1">
                            T - Tent
                          </span>

                          <span className="rounded-full bg-slate-700 px-3 py-1">
                            C - Camper
                          </span>

                          <span className="rounded-full bg-slate-700 px-3 py-1">
                            B - Bungalow
                          </span>

                          <span className="rounded-full bg-slate-700 px-3 py-1">
                            A - Apartment
                          </span>

                          <span className="rounded-full bg-slate-700 px-3 py-1">
                            P - Pool cottage
                          </span>
                        </div>
                      </div>
                    )}

                  {/* WHY THIS LOCATION */}
                  <div className="rounded-2xl border border-emerald-700 bg-emerald-950/30 p-4 sm:p-5">
                    <h3 className="mb-3 text-lg font-semibold sm:text-xl">
                      Why this location?
                    </h3>

                    <div className="space-y-2 text-sm text-slate-300">
                      {listing.distanceToBeach !== null && (
                        <p>
                          ✔ Beach is only{" "}
                          {listing.distanceToBeach} m away.
                        </p>
                      )}

                      {listing.distanceToParking !== null && (
                        <p>
                          ✔ Parking is{" "}
                          {listing.distanceToParking} m from this
                          accommodation.
                        </p>
                      )}

                      {listing.shadeLevel !== null && (
                        <p>
                          ✔ Shade level is{" "}
                          {listing.shadeLevel}%, which helps guests
                          choose a more comfortable place during
                          summer.
                        </p>
                      )}

                      {listing.noiseLevel !== null && (
                        <p>
                          ✔ Noise level is{" "}
                          {listing.noiseLevel}/10, useful for guests
                          who prefer quieter or more active zones.
                        </p>
                      )}

                      {listing.recommendedFor && (
                        <p>
                          ✔ Recommended for:{" "}
                          {formatValue(
                            listing.recommendedFor
                          )}
                          .
                        </p>
                      )}

                      {listing.distanceToBeach === null &&
                        listing.distanceToParking === null &&
                        listing.shadeLevel === null &&
                        listing.noiseLevel === null &&
                        !listing.recommendedFor && (
                          <p>
                            Spatial data helps guests compare
                            accommodation based on position,
                            nearby facilities and comfort.
                          </p>
                        )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT SIDE */}
            <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
              <Card className="border-slate-800 bg-slate-900 text-white">
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

                    <p className="text-sm text-slate-400">
                      Per night
                    </p>
                  </div>

                  <BookmarkButton
                    listingId={listing.id}
                  />

                  <ReservationForm
                    listingId={listing.id}
                  />

                  {/* PROVIDER */}
                  <div className="border-t border-slate-700 pt-4">
                    <p className="font-semibold">
                      Provider
                    </p>

                    <p className="break-words text-sm text-slate-300">
                      {listing.provider?.name ??
                        "Unknown provider"}
                    </p>

                    {listing.provider?.email && (
                      <p className="break-words text-sm text-slate-400">
                        {listing.provider.email}
                      </p>
                    )}
                  </div>

                  {/* LINKS */}
                  <div className="space-y-3 text-sm">
                    <Link
                      href="/map"
                      prefetch={false}
                      className="block rounded-lg border border-slate-700 px-4 py-2 text-center hover:bg-slate-800"
                    >
                      Open full camp map
                    </Link>

                    {googleMapsHref && (
                      <a
                        href={googleMapsHref}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-lg border border-slate-700 px-4 py-2 text-center hover:bg-slate-800"
                      >
                        Open location in Google Maps
                      </a>
                    )}

                    <Link
                      href="/my-favorites"
                      prefetch={false}
                      className="block rounded-lg border border-slate-700 px-4 py-2 text-center hover:bg-slate-800"
                    >
                      Open my favorites
                    </Link>

                    <Link
                      href={`/provider/listings/edit/${listing.id}`}
                      prefetch={false}
                      className="block rounded-lg bg-blue-600 px-4 py-2 text-center font-medium text-white transition hover:bg-blue-500"
                    >
                      Edit accommodation
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}