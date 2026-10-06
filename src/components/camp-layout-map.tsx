"use client";

import { useRouter } from "next/navigation";

type Listing = {
  id: string;
  title: string;
  type: string;
  mapX: number | null;
  mapY: number | null;
  price?: number | null;
};

type Props = {
  imageUrl: string;
  listings: Listing[];
  selectedListingId?: string | null;
};

const typeColors: Record<string, string> = {
  TENT_PITCH: "#22c55e",
  CAMPER_PITCH: "#3b82f6",
  BUNGALOW: "#f97316",
  APARTMENT: "#a855f7",
  POOL_COTTAGE: "#facc15",
};

function getMarkerLabel(type: string) {
  if (type === "TENT_PITCH") return "T";
  if (type === "CAMPER_PITCH") return "C";
  if (type === "BUNGALOW") return "B";
  if (type === "APARTMENT") return "A";
  if (type === "POOL_COTTAGE") return "P";
  return "?";
}

export function CampLayoutMap({
  imageUrl,
  listings,
  selectedListingId,
}: Props) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="relative w-full overflow-hidden rounded-xl border">
        <img src={imageUrl} alt="Camp layout" className="w-full object-cover" />

        {listings.map((listing) => {
          if (listing.mapX === null || listing.mapY === null) return null;

          const markerColor = typeColors[listing.type] ?? "#6b7280";

          return (
            <button
              key={listing.id}
              type="button"
              onClick={() => router.push(`/listing/${listing.id}`)}
              title={`${listing.title} - ${listing.type}`}
              className={`absolute flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white shadow-lg transition hover:scale-110 ${
                selectedListingId === listing.id ? "ring-4 ring-white" : ""
              }`}
              style={{
                left: `${listing.mapX}%`,
                top: `${listing.mapY}%`,
                transform: "translate(-50%, -50%)",
                backgroundColor: markerColor,
              }}
            >
              {getMarkerLabel(listing.type)}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-4 text-sm font-medium">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-500" />
          Tent Pitch
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-blue-500" />
          Camper Pitch
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-orange-500" />
          Bungalow
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-purple-500" />
          Apartment
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          Pool Cottage
        </div>
      </div>
    </div>
  );
}