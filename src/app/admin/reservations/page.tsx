import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import {
  approveReservation,
  rejectReservation,
  completeReservation,
} from "./actions";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getStatusBadge(status: string) {
  switch (status) {
    case "PENDING":
      return (
        <Badge className="bg-yellow-500 text-black hover:bg-yellow-500">
          Pending
        </Badge>
      );

    case "CONFIRMED":
      return (
        <Badge className="bg-green-600 text-white hover:bg-green-600">
          Confirmed
        </Badge>
      );

    case "CANCELLED":
      return <Badge variant="destructive">Cancelled</Badge>;

    case "COMPLETED":
      return (
        <Badge className="bg-blue-600 text-white hover:bg-blue-600">
          Completed
        </Badge>
      );

    default:
      return <Badge>{status}</Badge>;
  }
}

export default async function AdminReservationsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <div className="p-6">
        <p className="text-red-500">
          Access Denied. You must be an admin.
        </p>
      </div>
    );
  }

  const reservations = await prisma.reservation.findMany({
    include: {
      user: {
        include: {
          guestReviewsReceived: true,
        },
      },

      listing: {
        include: {
          provider: true,
        },
      },

      guestReview: {
        include: {
          provider: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  const pendingCount = reservations.filter(
    (reservation) => reservation.status === "PENDING"
  ).length;

  const confirmedCount = reservations.filter(
    (reservation) => reservation.status === "CONFIRMED"
  ).length;

  const completedCount = reservations.filter(
    (reservation) => reservation.status === "COMPLETED"
  ).length;

  const cancelledCount = reservations.filter(
    (reservation) => reservation.status === "CANCELLED"
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Admin - Reservations
        </h1>

        <p className="text-muted-foreground">
          Review, approve and manage all reservations in the system.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>
              Pending
            </CardDescription>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">
              {pendingCount}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>
              Confirmed
            </CardDescription>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">
              {confirmedCount}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>
              Completed
            </CardDescription>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">
              {completedCount}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>
              Cancelled
            </CardDescription>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">
              {cancelledCount}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            All Reservations
          </CardTitle>

          <CardDescription>
            Approve pending reservations, reject them or mark confirmed
            stays as completed.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {reservations.length === 0 ? (
            <p className="text-muted-foreground">
              No reservations found.
            </p>
          ) : (
            <div className="space-y-4">
              {reservations.map((reservation) => {
                const reviews =
                  reservation.user?.guestReviewsReceived ?? [];

                const averageRating =
                  reviews.length > 0
                    ? reviews.reduce(
                        (sum, review) =>
                          sum + review.overallRating,
                        0
                      ) / reviews.length
                    : null;

                return (
                  <div
                    key={reservation.id}
                    className="rounded-lg border p-5"
                  >
                    <div className="flex flex-col justify-between gap-4 lg:flex-row">
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {reservation.listing.title}
                          </h3>

                          <div className="mt-2">
                            {getStatusBadge(
                              reservation.status
                            )}
                          </div>
                        </div>

                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="font-medium">
                              Guest:
                            </span>{" "}
                            {reservation.user?.name ||
                              reservation.user?.email ||
                              "Unknown guest"}
                          </p>

                          {reservation.user?.email && (
                            <p>
                              <span className="font-medium">
                                Email:
                              </span>{" "}
                              {reservation.user.email}
                            </p>
                          )}

                          <p>
                            <span className="font-medium">
                              Provider:
                            </span>{" "}
                            {reservation.listing.provider?.name ||
                              reservation.listing.provider?.email ||
                              "Unknown provider"}
                          </p>

                          <p>
                            <span className="font-medium">
                              Check-in:
                            </span>{" "}
                            {formatDate(
                              reservation.checkIn
                            )}
                          </p>

                          <p>
                            <span className="font-medium">
                              Check-out:
                            </span>{" "}
                            {formatDate(
                              reservation.checkOut
                            )}
                          </p>

                          <p>
                            <span className="font-medium">
                              Guests:
                            </span>{" "}
                            {reservation.guests}
                          </p>

                          <p>
                            <span className="font-medium">
                              Guest rating:
                            </span>{" "}
                            {averageRating !== null
                              ? `${averageRating.toFixed(
                                  1
                                )}/5`
                              : "No reviews yet"}
                          </p>
                        </div>
                      </div>

                      <div className="flex min-w-[180px] flex-col gap-2">
                        {reservation.status ===
                          "PENDING" && (
                          <>
                            <form
                              action={async () => {
                                "use server";

                                await approveReservation(
                                  reservation.id
                                );
                              }}
                            >
                              <Button
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-700"
                              >
                                Approve
                              </Button>
                            </form>

                            <form
                              action={async () => {
                                "use server";

                                await rejectReservation(
                                  reservation.id
                                );
                              }}
                            >
                              <Button
                                type="submit"
                                variant="destructive"
                                className="w-full"
                              >
                                Reject
                              </Button>
                            </form>
                          </>
                        )}

                        {reservation.status ===
                          "CONFIRMED" && (
                          <form
                            action={async () => {
                              "use server";

                              await completeReservation(
                                reservation.id
                              );
                            }}
                          >
                            <Button
                              type="submit"
                              className="w-full"
                            >
                              Mark as completed
                            </Button>
                          </form>
                        )}
                      </div>
                    </div>

                    {reservation.guestReview && (
                      <div className="mt-5 rounded-lg border bg-muted/40 p-4 text-sm">
                        <p className="mb-2 font-semibold">
                          Review for this stay
                        </p>

                        <p>
                          Cleanliness:{" "}
                          {
                            reservation.guestReview
                              .cleanlinessRating
                          }
                          /5
                        </p>

                        <p>
                          Rules:{" "}
                          {
                            reservation.guestReview
                              .rulesRating
                          }
                          /5
                        </p>

                        <p>
                          Communication:{" "}
                          {
                            reservation.guestReview
                              .communicationRating
                          }
                          /5
                        </p>

                        <p>
                          Overall:{" "}
                          {
                            reservation.guestReview
                              .overallRating
                          }
                          /5
                        </p>

                        {reservation.guestReview
                          .comment && (
                          <p className="mt-2">
                            Comment:{" "}
                            {
                              reservation.guestReview
                                .comment
                            }
                          </p>
                        )}

                        <p className="mt-2 text-muted-foreground">
                          Reviewed by:{" "}
                          {reservation.guestReview
                            .provider.name ||
                            reservation.guestReview
                              .provider.email}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}