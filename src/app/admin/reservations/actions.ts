"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function ensureAdmin() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function approveReservation(reservationId: string) {
  await ensureAdmin();

  await prisma.reservation.update({
    where: {
      id: reservationId,
    },
    data: {
      status: "CONFIRMED",
    },
  });

  revalidatePath("/admin/reservations");
  revalidatePath("/my-reservations");
  revalidatePath("/provider/reservations");
}

export async function rejectReservation(reservationId: string) {
  await ensureAdmin();

  await prisma.reservation.update({
    where: {
      id: reservationId,
    },
    data: {
      status: "CANCELLED",
    },
  });

  revalidatePath("/admin/reservations");
  revalidatePath("/my-reservations");
  revalidatePath("/provider/reservations");
}

export async function completeReservation(reservationId: string) {
  await ensureAdmin();

  await prisma.reservation.update({
    where: {
      id: reservationId,
    },
    data: {
      status: "COMPLETED",
    },
  });

  revalidatePath("/admin/reservations");
  revalidatePath("/my-reservations");
  revalidatePath("/provider/reservations");
}