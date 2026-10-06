"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  calculateSpatialScore,
  SpatialPreferences,
} from "@/lib/spatial-ranking";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ListingData = {
  id: string;
  title: string;
  city: string;
  price: number;

  image: string | null;

  distanceToBeach: number | null;
  distanceToToilet: number | null;
  distanceToParking: number | null;

  noiseLevel: number | null;
  shadeLevel: number | null;
  terrainSlope: number | null;

  spatialZone: string | null;
  recommendedFor: string | null;

  photos: {
    id: string;
    url: string;
  }[];

  camp: {
    id: string;
    name: string;
  } | null;
};

type QuickProfile =
  | "FAMILY"
  | "CAMPER"
  | "QUIET"
  | "BEACH"
  | null;

const initialPreferences: SpatialPreferences = {
  closeToBeach: false,
  closeToToilet: false,
  closeToParking: false,
  quiet: false,
  shade: false,
  flatTerrain: false,
};

const profilePreferences: Record<
  Exclude<QuickProfile, null>,
  SpatialPreferences
> = {
  FAMILY: {
    closeToBeach: false,
    closeToToilet: true,
    closeToParking: false,
    quiet: true,
    shade: true,
    flatTerrain: false,
  },

  CAMPER: {
    closeToBeach: false,
    closeToToilet: false,
    closeToParking: true,
    quiet: false,
    shade: false,
    flatTerrain: true,
  },

  QUIET: {
    closeToBeach: false,
    closeToToilet: false,
    closeToParking: false,
    quiet: true,
    shade: true,
    flatTerrain: false,
  },

  BEACH: {
    closeToBeach: true,
    closeToToilet: false,
    closeToParking: false,
    quiet: false,
    shade: false,
    flatTerrain: false,
  },
};

export function SmartSearchClient({
  listings,
}: {
  listings: ListingData[];
}) {
  const [preferences, setPreferences] =
    useState<SpatialPreferences>(
      initialPreferences
    );

  const [selectedProfile, setSelectedProfile] =
    useState<QuickProfile>(null);

  const rankedListings = useMemo(() => {
    return listings
      .map((listing) => {
        const ranking =
          calculateSpatialScore(
            listing,
            preferences
          );

        return {
          ...listing,
          spatialScore: ranking.score,
          spatialReasons: ranking.reasons,
        };
      })
      .sort(
        (a, b) =>
          b.spatialScore -
          a.spatialScore
      );
  }, [listings, preferences]);

  function toggle(
    key: keyof SpatialPreferences
  ) {
    setSelectedProfile(null);

    setPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  function active(
    key: keyof SpatialPreferences
  ) {
    return preferences[key];
  }

  function applyProfile(
    profile: Exclude<
      QuickProfile,
      null
    >
  ) {
    setSelectedProfile(profile);

    setPreferences({
      ...profilePreferences[profile],
    });
  }

  function resetSearch() {
    setSelectedProfile(null);

    setPreferences({
      ...initialPreferences,
    });
  }

  const hasPreferences =
    Object.values(
      preferences
    ).some(Boolean);

  return (
    <div className="space-y-8">

      {/* ============================================================ */}
      {/* QUICK PROFILES                                               */}
      {/* ============================================================ */}

      <Card className="border-blue-900/60">
        <CardHeader>
          <CardTitle>
            Quick Profiles
          </CardTitle>

          <p className="text-sm text-muted-foreground">
            Choose a predefined travel profile
            or select your own spatial
            preferences below.
          </p>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <Button
              type="button"
              variant={
                selectedProfile ===
                "FAMILY"
                  ? "default"
                  : "outline"
              }
              className="h-auto min-h-20 flex-col gap-1 py-3"
              onClick={() =>
                applyProfile("FAMILY")
              }
            >
              <span className="text-xl">
                👨‍👩‍👧
              </span>

              <span>Family</span>

              <span className="text-xs font-normal opacity-70">
                Toilet · Quiet · Shade
              </span>
            </Button>

            <Button
              type="button"
              variant={
                selectedProfile ===
                "CAMPER"
                  ? "default"
                  : "outline"
              }
              className="h-auto min-h-20 flex-col gap-1 py-3"
              onClick={() =>
                applyProfile("CAMPER")
              }
            >
              <span className="text-xl">
                🚐
              </span>

              <span>Camper</span>

              <span className="text-xs font-normal opacity-70">
                Parking · Flat terrain
              </span>
            </Button>

            <Button
              type="button"
              variant={
                selectedProfile ===
                "QUIET"
                  ? "default"
                  : "outline"
              }
              className="h-auto min-h-20 flex-col gap-1 py-3"
              onClick={() =>
                applyProfile("QUIET")
              }
            >
              <span className="text-xl">
                🤫
              </span>

              <span>Quiet Stay</span>

              <span className="text-xs font-normal opacity-70">
                Quiet · More shade
              </span>
            </Button>

            <Button
              type="button"
              variant={
                selectedProfile ===
                "BEACH"
                  ? "default"
                  : "outline"
              }
              className="h-auto min-h-20 flex-col gap-1 py-3"
              onClick={() =>
                applyProfile("BEACH")
              }
            >
              <span className="text-xl">
                🏖
              </span>

              <span>Beach Lover</span>

              <span className="text-xs font-normal opacity-70">
                Close to beach
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ============================================================ */}
      {/* CUSTOM PREFERENCES                                           */}
      {/* ============================================================ */}

      <Card>
        <CardHeader>
          <CardTitle>
            What matters to you?
          </CardTitle>

          <p className="text-sm text-muted-foreground">
            Customize the spatial criteria that
            should influence accommodation
            ranking.
          </p>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-3">

            <Button
              type="button"
              variant={
                active("closeToBeach")
                  ? "default"
                  : "outline"
              }
              onClick={() =>
                toggle("closeToBeach")
              }
            >
              🏖 Close to beach
            </Button>

            <Button
              type="button"
              variant={
                active("closeToToilet")
                  ? "default"
                  : "outline"
              }
              onClick={() =>
                toggle("closeToToilet")
              }
            >
              🚻 Close to toilet
            </Button>

            <Button
              type="button"
              variant={
                active("closeToParking")
                  ? "default"
                  : "outline"
              }
              onClick={() =>
                toggle("closeToParking")
              }
            >
              🅿️ Close to parking
            </Button>

            <Button
              type="button"
              variant={
                active("quiet")
                  ? "default"
                  : "outline"
              }
              onClick={() =>
                toggle("quiet")
              }
            >
              🤫 Quiet location
            </Button>

            <Button
              type="button"
              variant={
                active("shade")
                  ? "default"
                  : "outline"
              }
              onClick={() =>
                toggle("shade")
              }
            >
              🌳 More shade
            </Button>

            <Button
              type="button"
              variant={
                active("flatTerrain")
                  ? "default"
                  : "outline"
              }
              onClick={() =>
                toggle("flatTerrain")
              }
            >
              ⛺ Flat terrain
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={resetSearch}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ============================================================ */}
      {/* RESULTS TITLE                                                */}
      {/* ============================================================ */}

      <div>
        <h2 className="text-2xl font-bold">
          Recommended accommodations
        </h2>

        <p className="text-muted-foreground">
          {selectedProfile
            ? `Results are ranked for the ${
                selectedProfile === "FAMILY"
                  ? "Family"
                  : selectedProfile === "CAMPER"
                    ? "Camper"
                    : selectedProfile === "QUIET"
                      ? "Quiet Stay"
                      : "Beach Lover"
              } profile.`
            : hasPreferences
              ? "Results are ranked according to your spatial preferences."
              : "Select a quick profile or one or more preferences to activate spatial ranking."}
        </p>
      </div>

      {/* ============================================================ */}
      {/* RESULTS                                                      */}
      {/* ============================================================ */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {rankedListings.map(
          (listing, index) => (
            <Card
              key={listing.id}
              className="overflow-hidden"
            >
              <div className="relative">
                <img
                  src={
                    listing.image ??
                    listing.photos[0]?.url ??
                    "/placeholder.jpg"
                  }
                  alt={listing.title}
                  className="h-52 w-full object-cover"
                />

                {hasPreferences && (
                  <>
                    <div className="absolute left-3 top-3 rounded-full bg-black/80 px-3 py-1 text-sm font-semibold text-white">
                      #{index + 1}
                    </div>

                    <div className="absolute right-3 top-3 rounded-full bg-blue-600 px-3 py-1 font-bold text-white">
                      {listing.spatialScore}% Match
                    </div>
                  </>
                )}
              </div>

              <CardHeader>
                <CardTitle>
                  {listing.title}
                </CardTitle>

                <p className="text-sm text-muted-foreground">
                  {listing.camp?.name} ·{" "}
                  {listing.city}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">

                <div className="text-xl font-bold">
                  {listing.price} KM

                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    / night
                  </span>
                </div>

                {/* WHY THIS MATCHES */}

                {hasPreferences &&
                  listing.spatialReasons.length >
                    0 && (
                    <div className="rounded-lg bg-slate-900 p-3">
                      <p className="mb-2 font-semibold">
                        Why this matches:
                      </p>

                      <ul className="space-y-1 text-sm text-slate-300">
                        {listing.spatialReasons.map(
                          (
                            reason,
                            reasonIndex
                          ) => (
                            <li
                              key={
                                reasonIndex
                              }
                            >
                              ✓ {reason}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {/* DISTANCES */}

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-md bg-slate-900 p-2">
                    🏖
                    <br />
                    {listing.distanceToBeach ??
                      "—"}{" "}
                    m
                  </div>

                  <div className="rounded-md bg-slate-900 p-2">
                    🚻
                    <br />
                    {listing.distanceToToilet ??
                      "—"}{" "}
                    m
                  </div>

                  <div className="rounded-md bg-slate-900 p-2">
                    🅿️
                    <br />
                    {listing.distanceToParking ??
                      "—"}{" "}
                    m
                  </div>
                </div>

                {/* ACTIONS */}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                  <Button
                    asChild
                    className="w-full"
                  >
                    <Link
                      href={`/listing/${listing.id}`}
                    >
                      View accommodation
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="w-full"
                  >
                    <Link
                      href={`/map?listingId=${listing.id}`}
                    >
                      📍 Show on Map
                    </Link>
                  </Button>

                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}