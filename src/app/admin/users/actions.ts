"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role, UserStatus } from "@prisma/client";

export async function updateUserRole(formData: FormData) {
  const userId = formData.get("userId") as string;
  const role = formData.get("role") as Role;

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/admin/users");
}

export async function updateUserStatus(formData: FormData) {
  const userId = formData.get("userId") as string;
  const status = formData.get("status") as UserStatus;

  await prisma.user.update({
    where: { id: userId },
    data: { status },
  });

  revalidatePath("/admin/users");
}

export async function deleteUser(formData: FormData) {
  const userId = formData.get("userId") as string;

  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath("/admin/users");
}