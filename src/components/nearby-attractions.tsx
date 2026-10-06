'use client';

import { useEffect, useState } from 'react';

type Attraction = {
  id?: string;
  displayName?: {
    text?: string;
  };
  formattedAddress?: string;
  rating?: number;
  googleMapsUri?: string;
  primaryType?: string;
  photoUrl?: string | null;
  distanceKm?: number;
};

export function NearbyAttractions({ listingId }: { listingId: string }) {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`/api/attractions?listingId=${listingId}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to fetch nearby attractions');
          setAttractions([]);
          return;
        }

        setAttractions(data.attractions || []);
      } catch (error) {
        console.error(error);
        setError('Failed to fetch nearby attractions');
      } finally {
        setLoading(false);
      }
    };

    fetchAttractions();
  }, [listingId]);

  if (loading) {
    return (
      <div className="mt-6 rounded-xl border p-4">
        <h2 className="mb-3 text-lg font-semibold">Nearby attractions</h2>
        <p className="text-sm text-muted-foreground">
          Loading nearby attractions...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 rounded-xl border p-4">
        <h2 className="mb-3 text-lg font-semibold">Nearby attractions</h2>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (attractions.length === 0) {
    return (
      <div className="mt-6 rounded-xl border p-4">
        <h2 className="mb-3 text-lg font-semibold">Nearby attractions</h2>
        <p className="text-sm text-muted-foreground">
          No attractions found nearby.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl border p-4">
      <h2 className="mb-4 text-lg font-semibold">Nearby attractions</h2>

      <div className="space-y-4">
        {attractions.map((attraction, index) => (
          <div
            key={attraction.id ?? index}
            className="overflow-hidden rounded-xl border"
          >
            {attraction.photoUrl ? (
              <img
                src={attraction.photoUrl}
                alt={attraction.displayName?.text ?? 'Attraction'}
                className="h-48 w-full object-cover"
              />
            ) : (
              <div className="flex h-48 w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                No image available
              </div>
            )}

            <div className="p-4">
              <p className="text-lg font-semibold">
                {attraction.displayName?.text ?? 'Unknown attraction'}
              </p>

              {attraction.formattedAddress && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {attraction.formattedAddress}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                {attraction.primaryType && (
                  <span className="rounded-md border px-2 py-1">
                    {attraction.primaryType.replace(/_/g, ' ')}
                  </span>
                )}

                {typeof attraction.distanceKm === 'number' && (
                  <span className="rounded-md border px-2 py-1">
                    {attraction.distanceKm} km away
                  </span>
                )}

                {typeof attraction.rating === 'number' && (
                  <span className="rounded-md border px-2 py-1">
                    ⭐ {attraction.rating}
                  </span>
                )}
              </div>

              {attraction.googleMapsUri && (
                <a
                  href={attraction.googleMapsUri}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block text-sm font-medium text-primary underline"
                >
                  Open in Google Maps
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}