import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

import { SpatialSettingsForm } from "./SpatialSettingsForm";

export default async function SpatialSettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== Role.PROVIDER) {
    redirect("/");
  }

  const camps = await prisma.camp.findMany({
    where: {
      ownerId: session.user.id,
    },

    orderBy: {
      name: "asc",
    },

    include: {
      pointsOfInterest: true,
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Camp Spatial Settings
        </h1>

        <p className="mt-2 text-muted-foreground">
          Define real geographic reference
          locations inside the camp. These
          coordinates are used to automatically
          calculate distances between
          accommodation units and important
          facilities.
        </p>
      </div>

      <SpatialSettingsForm camps={camps} />
    </div>
  );
}