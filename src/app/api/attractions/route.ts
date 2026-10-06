import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type GooglePlace = {
  id?: string;
  displayName?: {
    text?: string;
  };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  primaryType?: string;
  types?: string[];
  location?: {
    latitude?: number;
    longitude?: number;
  };
  photos?: {
    name?: string;
    widthPx?: number;
    heightPx?: number;
  }[];
};

type ScoredPlace = GooglePlace & {
  score: number;
  distanceKm: number;
  photoUrl: string | null;
};

type SearchResult = {
  places: GooglePlace[];
  error?: unknown;
};

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.rating",
  "places.userRatingCount",
  "places.googleMapsUri",
  "places.primaryType",
  "places.types",
  "places.location",
  "places.photos",
].join(",");

const MAX_DISTANCE_KM = 70;

const SEARCHES = [
  {
    textQuery: "tourist attractions Jablanica Bosnia",
    includedType: "tourist_attraction",
  },
  {
    textQuery: "tourist attractions Konjic Bosnia",
    includedType: "tourist_attraction",
  },
  {
    textQuery: "museums Konjic Jablanica Bosnia",
    includedType: "museum",
  },
  {
    textQuery: "historical landmarks Konjic Jablanica Bosnia",
    includedType: "historical_landmark",
  },
  {
    textQuery: "national parks near Konjic Bosnia",
    includedType: "national_park",
  },
  {
    textQuery: "rafting Neretva Konjic",
  },
  {
    textQuery: "Jablanicko lake attractions",
  },
  {
    textQuery: "viewpoints near Jablanica Bosnia",
  },
];

const EXCLUDED_TYPES = new Set([
  "lodging",
  "campground",
  "rv_park",
  "hotel",
  "hostel",
  "motel",
  "guest_house",
  "bed_and_breakfast",
  "farmstay",
  "apartment_building",
  "extended_stay_hotel",
  "private_guest_room",
  "resort_hotel",
  "real_estate_agency",
]);

const BAD_NAME_KEYWORDS = [
  "camp",
  "kamp",
  "autocamp",
  "auto camp",
  "apartment",
  "apartman",
  "apartmani",
  "villa",
  "hotel",
  "hostel",
  "motel",
  "guesthouse",
  "guest house",
  "rooms",
  "resort",
  "accommodation",
  "smještaj",
  "smjestaj",
  "booking",
  "rental",
  "holiday home",
  "bungalow",
  "glamping",
];

const GOOD_NAME_KEYWORDS = [
  "museum",
  "muzej",
  "bunker",
  "rafting",
  "neretva",
  "national park",
  "park",
  "historical",
  "old bridge",
  "stari most",
  "fortress",
  "tvrđava",
  "tvrdava",
  "viewpoint",
  "vidikovac",
  "lake",
  "jezero",
  "waterfall",
  "vodopad",
  "necropolis",
  "stećak",
  "stecak",
];

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function hasAnyKeyword(
  text: string,
  keywords: string[]
) {
  const normalized = normalizeText(text);

  return keywords.some((keyword) =>
    normalized.includes(normalizeText(keyword))
  );
}

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const R = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return (
    R *
    (2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      ))
  );
}

function isExcludedPlace(place: GooglePlace) {
  const name =
    place.displayName?.text ?? "";

  const primaryType =
    place.primaryType ?? "";

  const types =
    place.types ?? [];

  if (EXCLUDED_TYPES.has(primaryType)) {
    return true;
  }

  if (
    types.some((type) =>
      EXCLUDED_TYPES.has(type)
    )
  ) {
    return true;
  }

  if (
    hasAnyKeyword(
      name,
      BAD_NAME_KEYWORDS
    )
  ) {
    return true;
  }

  return false;
}

function scorePlace(place: GooglePlace) {
  const name =
    place.displayName?.text ?? "";

  const primaryType =
    place.primaryType ?? "";

  const types =
    place.types ?? [];

  const rating =
    place.rating ?? 0;

  const userRatingCount =
    place.userRatingCount ?? 0;

  let score = 10;

  if (
    primaryType ===
    "national_park"
  ) {
    score += 60;
  }

  if (primaryType === "museum") {
    score += 55;
  }

  if (
    primaryType ===
    "historical_landmark"
  ) {
    score += 52;
  }

  if (
    primaryType ===
    "tourist_attraction"
  ) {
    score += 45;
  }

  if (
    types.includes(
      "national_park"
    )
  ) {
    score += 40;
  }

  if (types.includes("museum")) {
    score += 35;
  }

  if (
    types.includes(
      "historical_landmark"
    )
  ) {
    score += 34;
  }

  if (
    types.includes(
      "tourist_attraction"
    )
  ) {
    score += 25;
  }

  if (
    hasAnyKeyword(
      name,
      GOOD_NAME_KEYWORDS
    )
  ) {
    score += 35;
  }

  score += rating * 4;

  if (userRatingCount >= 1000) {
    score += 12;
  } else if (
    userRatingCount >= 300
  ) {
    score += 8;
  } else if (
    userRatingCount >= 100
  ) {
    score += 5;
  } else if (
    userRatingCount >= 30
  ) {
    score += 2;
  }

  return score;
}

function buildPhotoUrl(
  photoName?: string
) {
  if (!photoName) {
    return null;
  }

  return `/api/place-photo?name=${encodeURIComponent(
    photoName
  )}`;
}

async function searchText(
  apiKey: string,
  lat: number,
  lng: number,
  textQuery: string,
  includedType?: string
): Promise<SearchResult> {
  try {
    const body: Record<
      string,
      unknown
    > = {
      textQuery,

      pageSize: 20,

      rankPreference:
        "RELEVANCE",

      locationBias: {
        circle: {
          center: {
            latitude: lat,
            longitude: lng,
          },

          radius: 50000,
        },
      },

      regionCode: "BA",
      languageCode: "en",
    };

    /*
     * Ne koristimo strictTypeFiltering.
     * Time Google može vratiti i relevantna mjesta
     * koja nisu savršeno klasifikovana.
     */
    if (includedType) {
      body.includedType =
        includedType;
    }

    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          "X-Goog-Api-Key":
            apiKey,

          "X-Goog-FieldMask":
            FIELD_MASK,
        },

        body:
          JSON.stringify(body),

        cache: "no-store",
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      console.error(
        `Google Places error for "${textQuery}"`,
        {
          status:
            response.status,
          data,
        }
      );

      return {
        places: [],
        error: data,
      };
    }

    console.log(
      `Google Places "${textQuery}" returned`,
      data.places?.length ?? 0,
      "places"
    );

    return {
      places:
        data.places ?? [],
    };
  } catch (error) {
    console.error(
      `Google Places request failed for "${textQuery}"`,
      error
    );

    return {
      places: [],
      error,
    };
  }
}

export async function GET(
  req: Request
) {
  try {
    const { searchParams } =
      new URL(req.url);

    const listingId =
      searchParams.get("listingId");

    if (!listingId) {
      return NextResponse.json(
        {
          error:
            "Missing listingId",
        },
        {
          status: 400,
        }
      );
    }

    const listing =
      await prisma.listing.findUnique(
        {
          where: {
            id: listingId,
          },

          include: {
            camp: true,
          },
        }
      );

    if (!listing) {
      return NextResponse.json(
        {
          error:
            "Listing not found",
        },
        {
          status: 404,
        }
      );
    }

    const lat =
      listing.lat ??
      listing.camp?.lat;

    const lng =
      listing.lng ??
      listing.camp?.lng;

    if (
      lat == null ||
      lng == null
    ) {
      return NextResponse.json(
        {
          error:
            "Missing coordinates for listing or camp",
        },
        {
          status: 400,
        }
      );
    }

    const apiKey =
      process.env
        .GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Missing GOOGLE_MAPS_API_KEY",
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "Searching attractions around:",
      {
        listingId,
        lat,
        lng,
      }
    );

    const results =
      await Promise.all(
        SEARCHES.map(
          (search) =>
            searchText(
              apiKey,
              lat,
              lng,
              search.textQuery,
              search.includedType
            )
        )
      );

    const merged =
      results.flatMap(
        (result) =>
          result.places
      );

    console.log(
      "Total raw Google Places:",
      merged.length
    );

    const uniqueMap =
      new Map<
        string,
        GooglePlace
      >();

    for (const place of merged) {
      const key =
        place.id ||
        `${place.displayName?.text ?? ""}-${place.formattedAddress ?? ""}`;

      if (!key) {
        continue;
      }

      if (
        isExcludedPlace(place)
      ) {
        continue;
      }

      if (
        !uniqueMap.has(key)
      ) {
        uniqueMap.set(
          key,
          place
        );
      }
    }

    const attractions =
      Array.from(
        uniqueMap.values()
      )
        .map((place) => {
          const placeLat =
            place.location
              ?.latitude;

          const placeLng =
            place.location
              ?.longitude;

          if (
            placeLat == null ||
            placeLng == null
          ) {
            return null;
          }

          const distanceKm =
            getDistanceKm(
              lat,
              lng,
              placeLat,
              placeLng
            );

          const score =
            scorePlace(place);

          const photoUrl =
            buildPhotoUrl(
              place.photos?.[0]
                ?.name
            );

          return {
            ...place,

            score,

            distanceKm:
              Number(
                distanceKm.toFixed(
                  1
                )
              ),

            photoUrl,
          };
        })
        .filter(
          (
            place
          ): place is ScoredPlace =>
            place !== null &&
            place.distanceKm <=
              MAX_DISTANCE_KM
        )
        .sort((a, b) => {
          if (
            b.score !== a.score
          ) {
            return (
              b.score - a.score
            );
          }

          return (
            a.distanceKm -
            b.distanceKm
          );
        })
        .slice(0, 10);

    console.log(
      "Final attractions:",
      attractions.length
    );

    const errors =
      results
        .filter(
          (result) =>
            result.error
        )
        .map(
          (result) =>
            result.error
        );

    return NextResponse.json({
      attractions,

      /*
       * Samo tokom razvoja će ti ovo pomoći da vidiš
       * zašto Google nešto odbija.
       */
      ...(process.env.NODE_ENV ===
        "development" &&
      errors.length > 0
        ? {
            googleErrors:
              errors,
          }
        : {}),
    });
  } catch (error) {
    console.error(
      "Attractions route error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while loading attractions",
      },
      {
        status: 500,
      }
    );
  }
}