import { prisma } from "@/lib/prisma";
import { NewListingForm } from "./NewListingForm";

export default async function NewListingPage() {
  const amenities = await prisma.amenity.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const camps = await prisma.camp.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Add New Listing</h1>
        <p className="text-muted-foreground">
          Fill in the accommodation details and define spatial attributes such
          as zone, distance to facilities, shade, terrain slope and noise level.
        </p>
      </div>

      <NewListingForm amenities={amenities} camps={camps} />
    </div>
  );
}