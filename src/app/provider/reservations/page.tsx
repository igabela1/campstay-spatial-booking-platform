import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createGuestReview } from "./actions";

export default async function ProviderReservationsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "PROVIDER") {
    return <p>Access Denied. You must be a provider.</p>;
  }

  const reservations = await prisma.reservation.findMany({
    where: {
      listing: {
        providerId: session.user.id,
      },
    },
    include: {
      user: true,
      listing: true,
      guestReview: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Provider Reservations</h1>
        <p className="text-muted-foreground">
          Pregled rezervacija i ocjenjivanje gostiju nakon boravka.
        </p>
      </div>

      {reservations.length === 0 ? (
        <p className="text-muted-foreground">Nema rezervacija.</p>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="rounded-lg border p-4">
              <h2 className="text-xl font-semibold">
                {reservation.listing.title}
              </h2>

              <p>Gost: {reservation.user.name || reservation.user.email}</p>
              <p>Status: {reservation.status}</p>
              <p>Broj gostiju: {reservation.guests}</p>

              <p>
                Check-in:{" "}
                {new Date(reservation.checkIn).toLocaleDateString()}
              </p>

              <p>
                Check-out:{" "}
                {new Date(reservation.checkOut).toLocaleDateString()}
              </p>

              {reservation.status === "COMPLETED" &&
                !reservation.guestReview && (
                  <form
                    action={createGuestReview}
                    className="mt-4 space-y-3 rounded-lg border p-4"
                  >
                    <input
                      type="hidden"
                      name="reservationId"
                      value={reservation.id}
                    />

                    <input
                      type="hidden"
                      name="guestId"
                      value={reservation.userId}
                    />

                    <h3 className="font-semibold">Rate Guest</h3>

                    <label className="block">
                      Cleanliness after stay
                      <select
                        name="cleanlinessRating"
                        className="w-full rounded border p-2"
                      >
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Good</option>
                        <option value="3">3 - Average</option>
                        <option value="2">2 - Bad</option>
                        <option value="1">1 - Very bad</option>
                      </select>
                    </label>

                    <label className="block">
                      Respect of rules
                      <select
                        name="rulesRating"
                        className="w-full rounded border p-2"
                      >
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Good</option>
                        <option value="3">3 - Average</option>
                        <option value="2">2 - Bad</option>
                        <option value="1">1 - Very bad</option>
                      </select>
                    </label>

                    <label className="block">
                      Communication
                      <select
                        name="communicationRating"
                        className="w-full rounded border p-2"
                      >
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Good</option>
                        <option value="3">3 - Average</option>
                        <option value="2">2 - Bad</option>
                        <option value="1">1 - Very bad</option>
                      </select>
                    </label>

                    <label className="block">
                      Overall rating
                      <select
                        name="overallRating"
                        className="w-full rounded border p-2"
                      >
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Good</option>
                        <option value="3">3 - Average</option>
                        <option value="2">2 - Bad</option>
                        <option value="1">1 - Very bad</option>
                      </select>
                    </label>

                    <textarea
                      name="comment"
                      placeholder="Comment about the guest..."
                      className="w-full rounded border p-2"
                    />

                    <button className="rounded bg-black px-4 py-2 text-white">
                      Submit guest review
                    </button>
                  </form>
                )}

              {reservation.guestReview && (
                <div className="mt-4 rounded-lg border bg-muted p-4">
                  <p className="font-semibold">Guest already reviewed</p>
                  <p>
                    Overall rating: {reservation.guestReview.overallRating}/5
                  </p>
                  {reservation.guestReview.comment && (
                    <p>Comment: {reservation.guestReview.comment}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}