"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import { CampLayoutMap } from "@/components/camp-layout-map";
import { Button } from "@/components/ui/button";

const CampGeographicMap = dynamic(
  () =>
    import("@/components/camp-geographic-map").then(
      (module) => module.CampGeographicMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[600px] items-center justify-center rounded-xl border border-slate-800 bg-slate-900">
        Loading geographic map...
      </div>
    ),
  }
);

type Camp = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  mapImageUrl: string | null;
};

type Listing = {
  id: string;
  title: string;
  type: string;

  lat: number | null;
  lng: number | null;

  mapX: number | null;
  mapY: number | null;

  image?: string | null;
  price?: number | null;

  campId?: string | null;
  camp?: Camp | null;

  spatialZone?: string | null;

  distanceToToilet?: number | null;
  distanceToBeach?: number | null;
  distanceToParking?: number | null;

  shadeLevel?: number | null;
  terrainSlope?: number | null;
  noiseLevel?: number | null;

  recommendedFor?: string | null;
};

type PointOfInterest = {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  campId: string;
};

type MapPageClientProps = {
  listings: Listing[];
  pointsOfInterest: PointOfInterest[];
  selectedListingId?: string | null;
};

export function MapPageClient({
  listings,
  pointsOfInterest,
  selectedListingId = null,
}: MapPageClientProps) {
  const [selectedZone, setSelectedZone] =
    useState("");

  const [mapMode, setMapMode] = useState<
    "geographic" | "layout"
  >("geographic");

  const filteredListings = useMemo(() => {
    if (!selectedZone) {
      return listings;
    }

    return listings.filter(
      (listing) =>
        listing.spatialZone === selectedZone
    );
  }, [listings, selectedZone]);

  const layoutListings = useMemo(() => {
    return filteredListings.filter(
      (listing) =>
        listing.mapX !== null &&
        listing.mapY !== null
    );
  }, [filteredListings]);

  const geographicListings = useMemo(() => {
    return filteredListings.filter(
      (listing) =>
        listing.lat !== null &&
        listing.lng !== null
    );
  }, [filteredListings]);

  const selectedListing = useMemo(() => {
    if (!selectedListingId) {
      return null;
    }

    return listings.find(
      (listing) =>
        listing.id === selectedListingId
    ) ?? null;
  }, [listings, selectedListingId]);

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      {/* HEADER */}

      <div>
        <h1 className="text-3xl font-bold">
          Spatial Camp Map
        </h1>

        <p className="mt-2 text-muted-foreground">
          Explore accommodation units using both
          real geographic coordinates and the
          internal camp layout.
        </p>
      </div>

      {/* SELECTED LISTING INFO */}

      {selectedListing && (
        <div className="rounded-xl border border-blue-800 bg-blue-950/30 p-4">
          <p className="text-sm text-blue-300">
            Selected from Smart Search
          </p>

          <p className="mt-1 text-lg font-semibold">
            📍 {selectedListing.title}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            The geographic map will focus on this
            accommodation.
          </p>
        </div>
      )}

      {/* MAP MODE */}

      <div className="rounded-xl border bg-card p-4">
        <p className="mb-3 text-sm font-medium">
          Map view
        </p>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant={
              mapMode === "geographic"
                ? "default"
                : "outline"
            }
            onClick={() =>
              setMapMode("geographic")
            }
          >
            🌍 Geographic Map
          </Button>

          <Button
            type="button"
            variant={
              mapMode === "layout"
                ? "default"
                : "outline"
            }
            onClick={() =>
              setMapMode("layout")
            }
          >
            🗺 Camp Layout
          </Button>
        </div>
      </div>

      {/* FILTER */}

      <div className="rounded-xl border bg-card p-4">
        <label className="mb-2 block text-sm font-medium">
          Filter accommodation by spatial zone
        </label>

        <select
          className="w-full rounded-md border bg-background px-3 py-2 md:w-72"
          value={selectedZone}
          onChange={(event) =>
            setSelectedZone(
              event.target.value
            )
          }
        >
          <option value="">
            All zones
          </option>

          <option value="FAMILY">
            Family
          </option>

          <option value="QUIET">
            Quiet
          </option>

          <option value="BEACH">
            Beach
          </option>

          <option value="ADVENTURE">
            Adventure
          </option>

          <option value="CENTRAL">
            Central
          </option>
        </select>
      </div>

      {/* GEOGRAPHIC MAP */}

      {mapMode === "geographic" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">
              Geographic Map
            </h2>

            <p className="text-sm text-muted-foreground">
              Accommodation units and important
              camp facilities are positioned
              using real latitude and longitude
              coordinates.
            </p>
          </div>

          <CampGeographicMap
            listings={geographicListings}
            pointsOfInterest={
              pointsOfInterest
            }
            selectedListingId={
              selectedListingId
            }
          />
        </div>
      )}

      {/* INTERNAL CAMP LAYOUT */}

      {mapMode === "layout" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">
              Internal Camp Layout
            </h2>

            <p className="text-sm text-muted-foreground">
              This schematic view uses local
              mapX/mapY positions to show the
              internal arrangement of
              accommodation units.
            </p>
          </div>

          <CampLayoutMap
            imageUrl="/camp-layout.jpg"
            listings={layoutListings}
          />
        </div>
      )}

      {/* LEGEND */}

      {mapMode === "geographic" && (
        <div className="rounded-xl border bg-card p-4">
          <p className="mb-3 font-semibold">
            Map legend
          </p>

          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span>🔵 Accommodation</span>
            <span>🟣 Selected accommodation</span>
            <span>🏖 Beach</span>
            <span>🚻 Toilet</span>
            <span>🅿 Parking</span>
          </div>
        </div>
      )}

      {/* INFO */}

      <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
        {mapMode === "geographic"
          ? `Showing ${geographicListings.length} geographically positioned accommodation unit(s) and ${pointsOfInterest.length} point(s) of interest.`
          : `Showing ${layoutListings.length} accommodation unit(s) on the internal camp layout.`}
      </div>
    </div>
  );
}