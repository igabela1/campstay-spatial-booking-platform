"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search as SearchIcon } from "lucide-react";

import type { Listing as DbListing } from "@prisma/client";
import { getRandomListings, searchListings } from "@/lib/actions";
import type { Listing, MarkerData } from "@/lib/types";

function toUiListing(db: DbListing): Listing | null {
  if (db.lat === null || db.lng === null) {
    return null;
  }

  return {
    id: db.id,
    title: db.title,
    description: db.description,
    location: `${db.city}, ${db.address}`,
    price: db.price,
    type: db.type,
    capacity: db.capacity,
    status: db.status.toLowerCase() as "pending" | "approved" | "rejected",
    providerId: db.providerId,
    lat: db.lat,
    lng: db.lng,
    mapX: db.mapX,
    mapY: db.mapY,
  };
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([43.6609, 17.7603]);
  const [mapZoom, setMapZoom] = useState(10);

  const LeafletMap = useMemo(
    () =>
      dynamic(() => import("@/components/leaflet-map"), {
        ssr: false,
        loading: () => <div className="h-full w-full animate-pulse bg-muted" />,
      }),
    []
  );

  useEffect(() => {
    (async () => {
      const data = await getRandomListings();
      const mapped = data
        .map(toUiListing)
        .filter((item): item is Listing => item !== null);

      setListings(mapped);
    })();
  }, []);

  const markers: MarkerData[] = useMemo(
    () =>
      listings.map((listing) => ({
        position: [listing.lat, listing.lng],
        popupContent: (
          <div>
            <h3 className="font-semibold">{listing.title}</h3>
            <p>{listing.price} KM / night</p>
            <p className="text-xs text-muted-foreground">{listing.location}</p>
          </div>
        ),
        item: listing,
        type: "listing",
      })),
    [listings]
  );

  const handleSearch = async () => {
    const trimmed = query.trim();

    if (!trimmed) {
      const data = await getRandomListings();
      const mapped = data
        .map(toUiListing)
        .filter((item): item is Listing => item !== null);

      setListings(mapped);
      return;
    }

    const result = await searchListings(trimmed);
    const mapped = result
      .map(toUiListing)
      .filter((item): item is Listing => item !== null);

    setListings(mapped);

    if (mapped.length > 0) {
      setMapCenter([mapped[0].lat, mapped[0].lng]);
      setMapZoom(13);
    }
  };

  const handleMarkerClick = (item: Listing) => {
    setSelectedListing(item);
    setMapCenter([item.lat, item.lng]);
    setMapZoom(15);
  };

  const handlePopupClose = () => {
    setSelectedListing(null);
  };

  return (
    <div className="flex h-screen flex-col">
      <Header />

      <div className="flex flex-1 overflow-hidden pt-16">
        <aside className="w-full overflow-y-auto border-r md:w-1/3">
          <ScrollArea className="h-full">
            <div className="space-y-6 p-4">
              <div>
                <h2 className="text-xl font-semibold">Search Accommodation</h2>

                <div className="relative mt-2">
                  <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by city or accommodation name..."
                    className="pl-10"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSearch();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={handleSearch}
                  >
                    Search
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold">
                  {listings.length} result{listings.length === 1 ? "" : "s"}
                </h3>

                <div className="mt-4 space-y-4">
                  {listings.map((listing) => (
                    <Link
                      key={listing.id}
                      href={`/listing/${listing.id}`}
                      className="block"
                    >
                      <Card className="cursor-pointer p-4 transition hover:shadow-md">
                        <h4 className="font-semibold">{listing.title}</h4>
                        <p className="text-sm">{listing.price} KM / night</p>
                        <p className="text-xs text-muted-foreground">
                          {listing.location}
                        </p>
                      </Card>
                    </Link>
                  ))}

                  {listings.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No accommodation found.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </aside>

        <main className="hidden flex-1 bg-muted/30 md:block">
          <LeafletMap
            center={mapCenter}
            zoom={mapZoom}
            markers={markers}
            selectedListing={selectedListing}
            onMarkerClick={handleMarkerClick}
            onPopupClose={handlePopupClose}
          />
        </main>
      </div>
    </div>
  );
}