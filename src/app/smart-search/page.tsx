import { prisma } from "@/lib/prisma";
import { ListingStatus } from "@prisma/client";

import { SmartSearchClient } from "./SmartSearchClient";

export default async function SmartSearchPage() {
  const listings =
    await prisma.listing.findMany({
      where: {
        status:
          ListingStatus.APPROVED,
        isAvailable: true,
      },

      include: {
        photos: true,
        camp: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-10">
      <div>
        <h1 className="text-4xl font-bold">
          Smart Spatial Search
        </h1>

        <p className="mt-3 max-w-3xl text-muted-foreground">
          Select what matters to you. The
          system uses spatial characteristics
          of each accommodation to rank the
          results according to your individual
          preferences.
        </p>
      </div>

      <SmartSearchClient
        listings={listings}
      />
    </div>
  );
}