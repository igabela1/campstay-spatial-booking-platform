export type SpatialPreferences = {
  closeToBeach: boolean;
  closeToToilet: boolean;
  closeToParking: boolean;
  quiet: boolean;
  shade: boolean;
  flatTerrain: boolean;
};

export type SpatialListing = {
  distanceToBeach: number | null;
  distanceToToilet: number | null;
  distanceToParking: number | null;
  noiseLevel: number | null;
  shadeLevel: number | null;
  terrainSlope: number | null;
};

export type SpatialRankingResult = {
  score: number;
  reasons: string[];
};

function distanceScore(
  distance: number | null,
  maximumUsefulDistance = 150
) {
  if (distance === null) {
    return 0;
  }

  return Math.max(
    0,
    1 - distance / maximumUsefulDistance
  );
}

export function calculateSpatialScore(
  listing: SpatialListing,
  preferences: SpatialPreferences
): SpatialRankingResult {
  let score = 0;
  let maximumScore = 0;

  const reasons: string[] = [];

  if (preferences.closeToBeach) {
    maximumScore += 1;

    score += distanceScore(
      listing.distanceToBeach
    );

    if (listing.distanceToBeach !== null) {
      reasons.push(
        `${listing.distanceToBeach} m from beach`
      );
    }
  }

  if (preferences.closeToToilet) {
    maximumScore += 1;

    score += distanceScore(
      listing.distanceToToilet
    );

    if (listing.distanceToToilet !== null) {
      reasons.push(
        `${listing.distanceToToilet} m from toilet`
      );
    }
  }

  if (preferences.closeToParking) {
    maximumScore += 1;

    score += distanceScore(
      listing.distanceToParking
    );

    if (
      listing.distanceToParking !== null
    ) {
      reasons.push(
        `${listing.distanceToParking} m from parking`
      );
    }
  }

  if (preferences.quiet) {
    maximumScore += 1;

    if (listing.noiseLevel !== null) {
      const normalized =
        1 -
        Math.min(
          Math.max(
            listing.noiseLevel - 1,
            0
          ),
          9
        ) /
          9;

      score += normalized;

      if (listing.noiseLevel <= 3) {
        reasons.push("Quiet location");
      }
    }
  }

  if (preferences.shade) {
    maximumScore += 1;

    if (listing.shadeLevel !== null) {
      score +=
        Math.min(
          Math.max(
            listing.shadeLevel,
            0
          ),
          100
        ) / 100;

      if (listing.shadeLevel >= 50) {
        reasons.push(
          `Good shade (${listing.shadeLevel}%)`
        );
      }
    }
  }

  if (preferences.flatTerrain) {
    maximumScore += 1;

    if (
      listing.terrainSlope !== null
    ) {
      const normalized =
        1 -
        Math.min(
          listing.terrainSlope,
          20
        ) /
          20;

      score += normalized;

      if (
        listing.terrainSlope <= 5
      ) {
        reasons.push("Flat terrain");
      }
    }
  }

  if (maximumScore === 0) {
    return {
      score: 0,
      reasons: [],
    };
  }

  return {
    score: Math.round(
      (score / maximumScore) * 100
    ),
    reasons,
  };
}