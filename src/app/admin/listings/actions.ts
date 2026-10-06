"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function approveListing(formData: FormData) {
  const id = formData.get("id") as string;

  await prisma.listing.update({
    where: { id },
    data: { status: "APPROVED" },
  });

  revalidatePath("/admin/listings");
  revalidatePath("/accommodations");
  revalidatePath("/");
}

export async function rejectListing(formData: FormData) {
  const id = formData.get("id") as string;

  await prisma.listing.update({
    where: { id },
    data: { status: "REJECTED" },
  });

  revalidatePath("/admin/listings");
}