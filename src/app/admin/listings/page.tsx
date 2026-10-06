import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ListingStatus } from "@prisma/client";
import { approveListing, rejectListing } from "./actions";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminListingsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return <p>Access Denied. You must be an admin.</p>;
  }

  const listings = await prisma.listing.findMany({
    where: {
      status: ListingStatus.PENDING,
    },
    include: {
      camp: true,
      provider: true,
      photos: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">
          Admin - Listing Approvals
        </h1>
        <p className="text-muted-foreground">
          Review and approve accommodation listings added by providers.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Listings</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Listing</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Camp</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {listings.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    There are no pending listings.
                  </TableCell>
                </TableRow>
              ) : (
                listings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell className="font-medium">
                      <div>{listing.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {listing.city} · {listing.price} KM
                      </div>
                    </TableCell>

                    <TableCell>
                      {listing.provider?.name ||
                        listing.provider?.email ||
                        "Unknown provider"}
                    </TableCell>

                    <TableCell>{listing.camp?.name || "No camp"}</TableCell>

                    <TableCell>
                      {listing.spatialZone || "Not selected"}
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary">{listing.status}</Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <form action={approveListing}>
                          <input type="hidden" name="id" value={listing.id} />
                          <Button type="submit" size="sm">
                            Approve
                          </Button>
                        </form>

                        <form action={rejectListing}>
                          <input type="hidden" name="id" value={listing.id} />
                          <Button
                            type="submit"
                            size="sm"
                            variant="destructive"
                          >
                            Reject
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
