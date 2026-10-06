import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type AccommodationCardProps = {
  listing: {
    id: string;
    title: string;
    location: string;
    price: number;
    imageUrl?: string;
    imageHint?: string;

    spatialZone?: string | null;
    distanceToToilet?: number | null;
    distanceToBeach?: number | null;
    shadeLevel?: number | null;
    noiseLevel?: number | null;
    recommendedFor?: string | null;
  };
};

function formatValue(value?: string | null) {
  if (!value) return "";
  return value
    .replace("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function AccommodationCard({ listing }: AccommodationCardProps) {
  return (
    <Card className="overflow-hidden border border-border bg-card">
      <div className="relative h-64 w-full">
        <Image
          src={listing.imageUrl || "/logo.jpg"}
          alt={listing.title}
          fill
          className="object-cover"
        />
      </div>

      <CardContent className="space-y-4 p-6">
        <h3 className="text-2xl font-bold">{listing.title}</h3>

        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{listing.location}</span>
        </div>

        <p className="text-3xl font-bold">
          KM {listing.price}
          <span className="ml-2 text-base font-normal text-muted-foreground">
            / night
          </span>
        </p>

        <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
          <p className="mb-2 font-semibold text-foreground">Spatial details</p>

          <div className="grid grid-cols-1 gap-1">
            {listing.spatialZone && (
              <p>📍 Zone: {formatValue(listing.spatialZone)}</p>
            )}

            {listing.distanceToToilet !== null &&
              listing.distanceToToilet !== undefined && (
                <p>🚻 Toilet: {listing.distanceToToilet} m</p>
              )}

            {listing.distanceToBeach !== null &&
              listing.distanceToBeach !== undefined && (
                <p>🏖 Beach: {listing.distanceToBeach} m</p>
              )}

            {listing.shadeLevel !== null &&
              listing.shadeLevel !== undefined && (
                <p>🌳 Shade: {listing.shadeLevel}%</p>
              )}

            {listing.noiseLevel !== null &&
              listing.noiseLevel !== undefined && (
                <p>🔊 Noise: {listing.noiseLevel}/10</p>
              )}

            {listing.recommendedFor && (
              <p>👤 Best for: {formatValue(listing.recommendedFor)}</p>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/listing/${listing.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}