"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createGuestReview(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "PROVIDER") {
    throw new Error("Unauthorized");
  }

  const reservationId = formData.get("reservationId") as string;
  const guestId = formData.get("guestId") as string;

  await prisma.guestReview.create({
    data: {
      reservationId,
      guestId,
      providerId: session.user.id,
      cleanlinessRating: Number(formData.get("cleanlinessRating")),
      rulesRating: Number(formData.get("rulesRating")),
      communicationRating: Number(formData.get("communicationRating")),
      overallRating: Number(formData.get("overallRating")),
      comment: formData.get("comment") as string,
    },
  });

  revalidatePath("/provider/reservations");
}