"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import type {
  CircleMarker as LeafletCircleMarker,
} from "leaflet";

type Listing = {
  id: string;
  title: string;
  type: string;

  lat: number | null;
  lng: number | null;

  price?: number | null;
  image?: string | null;

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

type Props = {
  listings: Listing[];
  pointsOfInterest: PointOfInterest[];
  selectedListingId?: string | null;
};

/* ================================================================ */
/* HELPERS                                                          */
/* ================================================================ */

function getPoiLabel(type: string) {
  switch (type) {
    case "BEACH":
      return "🏖 Beach";

    case "TOILET":
      return "🚻 Toilet";

    case "PARKING":
      return "🅿 Parking";

    default:
      return "📍 Point of interest";
  }
}

function formatListingType(type: string) {
  switch (type) {
    case "TENT_PITCH":
      return "Tent Pitch";

    case "CAMPER_PITCH":
      return "Camper Pitch";

    case "BUNGALOW":
      return "Bungalow";

    case "APARTMENT":
      return "Apartment";

    case "POOL_COTTAGE":
      return "Pool Cottage";

    default:
      return type;
  }
}

function formatZone(
  zone?: string | null
) {
  if (!zone) {
    return "Not specified";
  }

  switch (zone) {
    case "FAMILY":
      return "Family Zone";

    case "QUIET":
      return "Quiet Zone";

    case "ADVENTURE":
      return "Adventure Zone";

    case "BEACH":
      return "Beach Zone";

    case "CENTRAL":
      return "Central Zone";

    default:
      return zone;
  }
}

function formatRecommendedFor(
  recommendedFor?: string | null
) {
  if (!recommendedFor) {
    return null;
  }

  switch (recommendedFor) {
    case "FAMILY":
      return "Family";

    case "CAMPER":
      return "Camper";

    case "BACKPACKER":
      return "Backpacker";

    case "DIGITAL_NOMAD":
      return "Digital Nomad";

    default:
      return recommendedFor;
  }
}

function formatDistance(
  distance?: number | null
) {
  if (
    distance === null ||
    distance === undefined
  ) {
    return "Not available";
  }

  return `${distance} m`;
}

/* ================================================================ */
/* MAP FOCUS                                                        */
/* ================================================================ */

function MapFocus({
  listing,
}: {
  listing: Listing | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (
      !listing ||
      listing.lat === null ||
      listing.lng === null
    ) {
      return;
    }

    map.setView(
      [
        listing.lat,
        listing.lng,
      ],
      20,
      {
        animate: true,
      }
    );
  }, [listing, map]);

  return null;
}

/* ================================================================ */
/* LISTING MARKER                                                   */
/* ================================================================ */

function ListingMarker({
  listing,
  selected,
}: {
  listing: Listing;
  selected: boolean;
}) {
  const markerRef =
    useRef<LeafletCircleMarker | null>(
      null
    );

  useEffect(() => {
    if (
      selected &&
      markerRef.current
    ) {
      const timeout =
        window.setTimeout(() => {
          markerRef.current?.openPopup();
        }, 400);

      return () =>
        window.clearTimeout(timeout);
    }
  }, [selected]);

  if (
    listing.lat === null ||
    listing.lng === null
  ) {
    return null;
  }

  const recommendedFor =
    formatRecommendedFor(
      listing.recommendedFor
    );

  return (
    <CircleMarker
      ref={markerRef}
      center={[
        listing.lat,
        listing.lng,
      ]}
      radius={selected ? 14 : 9}
      pathOptions={{
        color: selected
          ? "#ffffff"
          : "#ffffff",

        weight: selected ? 4 : 2,

        fillColor: selected
          ? "#9333ea"
          : "#2563eb",

        fillOpacity: 1,
      }}
    >
      <Popup>
        <div className="min-w-[250px] space-y-2">
          {selected && (
            <div className="rounded-md bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-800">
              📍 Selected from Smart Search
            </div>
          )}

          <div>
            <p className="text-base font-bold">
              🏕 {listing.title}
            </p>

            <p className="text-sm text-slate-600">
              {formatListingType(
                listing.type
              )}
            </p>
          </div>

          {listing.price !== null &&
            listing.price !==
              undefined && (
              <p className="text-lg font-semibold">
                {listing.price} KM
                <span className="text-sm font-normal text-slate-500">
                  {" "}
                  / night
                </span>
              </p>
            )}

          <div className="border-t pt-2 text-sm">
            <p>
              📍 Zone:{" "}
              <strong>
                {formatZone(
                  listing.spatialZone
                )}
              </strong>
            </p>

            {recommendedFor && (
              <p>
                👤 Recommended for:{" "}
                <strong>
                  {recommendedFor}
                </strong>
              </p>
            )}
          </div>

          <div className="border-t pt-2 text-sm">
            <p>
              🏖 Beach:{" "}
              <strong>
                {formatDistance(
                  listing.distanceToBeach
                )}
              </strong>
            </p>

            <p>
              🚻 Toilet:{" "}
              <strong>
                {formatDistance(
                  listing.distanceToToilet
                )}
              </strong>
            </p>

            <p>
              🅿 Parking:{" "}
              <strong>
                {formatDistance(
                  listing.distanceToParking
                )}
              </strong>
            </p>
          </div>

          <div className="border-t pt-2 text-sm">
            {listing.shadeLevel !==
              null &&
              listing.shadeLevel !==
                undefined && (
                <p>
                  🌳 Shade:{" "}
                  <strong>
                    {
                      listing.shadeLevel
                    }
                    %
                  </strong>
                </p>
              )}

            {listing.noiseLevel !==
              null &&
              listing.noiseLevel !==
                undefined && (
                <p>
                  🔊 Noise:{" "}
                  <strong>
                    {
                      listing.noiseLevel
                    }
                    /10
                  </strong>
                </p>
              )}

            {listing.terrainSlope !==
              null &&
              listing.terrainSlope !==
                undefined && (
                <p>
                  ⛰ Terrain slope:{" "}
                  <strong>
                    {
                      listing.terrainSlope
                    }
                    %
                  </strong>
                </p>
              )}
          </div>

          <div className="border-t pt-3">
            <Link
              href={`/listing/${listing.id}`}
              className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              View Accommodation
            </Link>
          </div>
        </div>
      </Popup>
    </CircleMarker>
  );
}

/* ================================================================ */
/* MAIN MAP                                                         */
/* ================================================================ */

export function CampGeographicMap({
  listings,
  pointsOfInterest,
  selectedListingId = null,
}: Props) {
  const selectedListing =
    selectedListingId
      ? listings.find(
          (listing) =>
            listing.id ===
            selectedListingId
        ) ?? null
      : null;

  const firstListing =
    listings.find(
      (listing) =>
        listing.lat !== null &&
        listing.lng !== null
    );

  const firstPoi =
    pointsOfInterest[0];

  /*
   * If user came from Smart Search,
   * start the map around that
   * accommodation.
   */
  const centerLat =
    selectedListing?.lat ??
    firstListing?.lat ??
    firstPoi?.lat ??
    43.68819;

  const centerLng =
    selectedListing?.lng ??
    firstListing?.lng ??
    firstPoi?.lng ??
    17.82955;

  const initialZoom =
    selectedListing ? 20 : 18;

  return (
    <div className="h-[600px] w-full overflow-hidden rounded-xl border border-slate-800">
      <MapContainer
        center={[
          centerLat,
          centerLng,
        ]}
        zoom={initialZoom}
        scrollWheelZoom
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* AUTO FOCUS */}

        <MapFocus
          listing={selectedListing}
        />

        {/* ============================================================ */}
        {/* ACCOMMODATION                                                */}
        {/* ============================================================ */}

        {listings.map(
          (listing) => (
            <ListingMarker
              key={listing.id}
              listing={listing}
              selected={
                listing.id ===
                selectedListingId
              }
            />
          )
        )}

        {/* ============================================================ */}
        {/* POINTS OF INTEREST                                           */}
        {/* ============================================================ */}

        {pointsOfInterest.map(
          (point) => (
            <CircleMarker
              key={point.id}
              center={[
                point.lat,
                point.lng,
              ]}
              radius={12}
              pathOptions={{
                color: "#ffffff",
                weight: 3,

                fillColor:
                  point.type ===
                  "BEACH"
                    ? "#06b6d4"
                    : point.type ===
                        "TOILET"
                      ? "#22c55e"
                      : point.type ===
                          "PARKING"
                        ? "#f59e0b"
                        : "#64748b",

                fillOpacity: 1,
              }}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <p className="text-base font-bold">
                    {getPoiLabel(
                      point.type
                    )}
                  </p>

                  <p className="mt-1 text-sm">
                    {point.name}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Important camp
                    facility
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          )
        )}
      </MapContainer>
    </div>
  );
}