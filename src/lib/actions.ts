"use server";

import { z } from "zod";
import * as bcryptjs from "bcryptjs";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculateDistanceMeters } from "@/lib/spatial";

import {
  AccommodationType,
  ListingStatus,
  PointOfInterestType,
  Role,
  SpatialZone,
  UserStatus,
  UserType,
} from "@prisma/client";

import type { Prisma } from "@prisma/client";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const SALT_ROUNDS = 10;

export type FormState = {
  success: boolean;
  message: string;
};

/* ========================================================================== */
/* PROVIDER SCHEMA                                                            */
/* ========================================================================== */

const providerSchema = z.object({
  providerName: z
    .string()
    .trim()
    .min(1, "Provider name is required."),

  contactName: z
    .string()
    .trim()
    .min(1, "Contact person name is required."),

  email: z
    .string()
    .trim()
    .email("A valid email address is required."),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters."),

  phone: z
    .string()
    .trim()
    .min(6, "A valid phone number is required."),

  address: z
    .string()
    .trim()
    .min(1, "Address is required."),

  nic: z
    .string()
    .trim()
    .min(3, "ID or business number is required."),

  propertyInfo: z
    .string()
    .trim()
    .optional(),

  agreedToTerms: z
    .boolean()
    .refine((value) => value, {
      message: "You must agree to the terms and conditions.",
    }),
});

/* ========================================================================== */
/* PROVIDER REGISTRATION                                                      */
/* ========================================================================== */

export async function registerProvider(
  values: z.infer<typeof providerSchema>
): Promise<FormState> {
  const validatedFields = providerSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      success: false,
      message: validatedFields.error.issues
        .map((error) => error.message)
        .join(", "),
    };
  }

  const {
    providerName,
    contactName,
    email,
    password,
    phone,
    address,
    nic,
  } = validatedFields.data;

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedIdentifier = nic.trim();

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return {
        success: false,
        message: "An account with this email address already exists.",
      };
    }

    const existingProvider = await prisma.provider.findUnique({
      where: {
        businessIdentifier: normalizedIdentifier,
      },
      select: {
        id: true,
      },
    });

    if (existingProvider) {
      return {
        success: false,
        message: "This ID or business number is already registered.",
      };
    }

    const hashedPassword = await bcryptjs.hash(password, SALT_ROUNDS);

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          name: contactName.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          role: Role.PROVIDER,
          status: UserStatus.PENDING,
        },
      });

      await tx.provider.create({
        data: {
          userId: user.id,
          name: providerName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          businessIdentifier: normalizedIdentifier,
          isVerified: false,
        },
      });
    });

    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/users");

    return {
      success: true,
      message:
        "Registration submitted successfully. Your account is waiting for administrator approval.",
    };
  } catch (error) {
    console.error("Provider registration failed:", error);

    return {
      success: false,
      message: "Provider registration failed. Please try again.",
    };
  }
}

/* ========================================================================== */
/* ADMIN HELPER                                                               */
/* ========================================================================== */

async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== Role.ADMIN) {
    throw new Error("Unauthorized");
  }

  return session;
}

/* ========================================================================== */
/* PROVIDER ADMIN ACTIONS                                                     */
/* ========================================================================== */

export async function approveProvider(
  userId: string
): Promise<FormState> {
  try {
    await requireAdmin();

    const provider = await prisma.provider.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!provider) {
      return {
        success: false,
        message: "Provider profile was not found.",
      };
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          role: Role.PROVIDER,
          status: UserStatus.APPROVED,
        },
      });

      await tx.provider.update({
        where: {
          userId,
        },
        data: {
          isVerified: true,
        },
      });
    });

    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/users");
    revalidatePath("/provider/profile");

    return {
      success: true,
      message: "Provider approved successfully.",
    };
  } catch (error) {
    console.error("Provider approval failed:", error);

    return {
      success: false,
      message: "Provider approval failed.",
    };
  }
}

export async function rejectProvider(
  userId: string
): Promise<FormState> {
  try {
    await requireAdmin();

    const provider = await prisma.provider.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!provider) {
      return {
        success: false,
        message: "Provider profile was not found.",
      };
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          status: UserStatus.REJECTED,
        },
      });

      await tx.provider.update({
        where: {
          userId,
        },
        data: {
          isVerified: false,
        },
      });
    });

    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/users");
    revalidatePath("/provider/profile");

    return {
      success: true,
      message: "Provider registration rejected.",
    };
  } catch (error) {
    console.error("Provider rejection failed:", error);

    return {
      success: false,
      message: "Provider rejection failed.",
    };
  }
}

/* ========================================================================== */
/* AMENITIES                                                                  */
/* ========================================================================== */

export async function createAmenity(
  formData: FormData
): Promise<void> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const icon = String(formData.get("icon") ?? "").trim();

  if (!name || !icon) {
    throw new Error("Amenity name and icon are required.");
  }

  const existingAmenity = await prisma.amenity.findUnique({
    where: {
      name,
    },
    select: {
      id: true,
    },
  });

  if (existingAmenity) {
    throw new Error("An amenity with this name already exists.");
  }

  await prisma.amenity.create({
    data: {
      name,
      icon,
    },
  });

  revalidatePath("/admin/settings");
}

export async function deleteAmenity(
  amenityId: string,
  _formData: FormData
): Promise<void> {
  await requireAdmin();

  const amenity = await prisma.amenity.findUnique({
    where: {
      id: amenityId,
    },
    select: {
      id: true,
    },
  });

  if (!amenity) {
    throw new Error("Amenity was not found.");
  }

  await prisma.amenity.delete({
    where: {
      id: amenityId,
    },
  });

  revalidatePath("/admin/settings");
}

/* ========================================================================== */
/* CAMP POINTS OF INTEREST                                                     */
/* ========================================================================== */

const campPointSchema = z.object({
  campId: z.string().trim().min(1, "Camp is required."),

  type: z.nativeEnum(PointOfInterestType),

  name: z.string().trim().min(1, "Name is required."),

  lat: z.coerce.number().finite().min(-90).max(90),

  lng: z.coerce.number().finite().min(-180).max(180),
});

export async function saveCampPointOfInterest(
  values: z.infer<typeof campPointSchema>
): Promise<FormState> {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== Role.PROVIDER) {
      return {
        success: false,
        message: "Not authorized.",
      };
    }

    const validatedFields = campPointSchema.safeParse(values);

    if (!validatedFields.success) {
      return {
        success: false,
        message:
          "Invalid data: " +
          validatedFields.error.issues
            .map((error) => error.message)
            .join(", "),
      };
    }

    const { campId, type, name, lat, lng } = validatedFields.data;

    const camp = await prisma.camp.findFirst({
      where: {
        id: campId,
        ownerId: session.user.id,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!camp) {
      return {
        success: false,
        message: "Camp was not found or does not belong to you.",
      };
    }

    const existingPoint =
      await prisma.campPointOfInterest.findFirst({
        where: {
          campId,
          type,
        },
        select: {
          id: true,
        },
      });

    if (existingPoint) {
      await prisma.campPointOfInterest.update({
        where: {
          id: existingPoint.id,
        },
        data: {
          name,
          lat,
          lng,
        },
      });
    } else {
      await prisma.campPointOfInterest.create({
        data: {
          name,
          type,
          lat,
          lng,
          campId,
        },
      });
    }

    const pointsOfInterest =
      await prisma.campPointOfInterest.findMany({
        where: {
          campId,
        },
      });

    const beach = pointsOfInterest.find(
      (point) => point.type === PointOfInterestType.BEACH
    );

    const toilet = pointsOfInterest.find(
      (point) => point.type === PointOfInterestType.TOILET
    );

    const parking = pointsOfInterest.find(
      (point) => point.type === PointOfInterestType.PARKING
    );

    const listings = await prisma.listing.findMany({
      where: {
        campId,
        lat: {
          not: null,
        },
        lng: {
          not: null,
        },
      },
      select: {
        id: true,
        title: true,
        lat: true,
        lng: true,
      },
    });

    const updates = listings.flatMap((listing) => {
      if (listing.lat === null || listing.lng === null) {
        return [];
      }

      const distanceToBeach = beach
        ? calculateDistanceMeters(
            listing.lat,
            listing.lng,
            beach.lat,
            beach.lng
          )
        : null;

      const distanceToToilet = toilet
        ? calculateDistanceMeters(
            listing.lat,
            listing.lng,
            toilet.lat,
            toilet.lng
          )
        : null;

      const distanceToParking = parking
        ? calculateDistanceMeters(
            listing.lat,
            listing.lng,
            parking.lat,
            parking.lng
          )
        : null;

      return [
        prisma.listing.update({
          where: {
            id: listing.id,
          },
          data: {
            distanceToBeach,
            distanceToToilet,
            distanceToParking,
          },
        }),
      ];
    });

    if (updates.length > 0) {
      await prisma.$transaction(updates);
    }

    revalidatePath("/provider/camp/spatial-settings");
    revalidatePath("/provider/dashboard");
    revalidatePath("/accommodation");
    revalidatePath("/listings");
    revalidatePath("/map");
    revalidatePath("/smart-search");

    return {
      success: true,
      message: `${name} location saved successfully.`,
    };
  } catch (error) {
    console.error("ERROR SAVING CAMP POI:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to save camp spatial location.",
    };
  }
}

/* ========================================================================== */
/* LISTING SCHEMA                                                             */
/* ========================================================================== */

const listingFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),

  description: z
    .string()
    .trim()
    .min(1, "Description is required."),

  address: z.string().trim().min(1, "Address is required."),

  city: z.string().trim().min(1, "City is required."),

  price: z.coerce
    .number()
    .finite()
    .min(1, "Price must be greater than 0."),

  type: z.nativeEnum(AccommodationType),

  capacity: z.coerce
    .number()
    .int()
    .min(1, "Capacity must be at least 1."),

  amenities: z.array(z.string()).default([]),

  lat: z.coerce.number().finite().min(-90).max(90),

  lng: z.coerce.number().finite().min(-180).max(180),

  photos: z
    .array(z.string().trim().min(1))
    .min(1, "At least one photo is required.")
    .max(5, "Maximum 5 photos are allowed."),

  mapX: z.number().min(0).max(100).nullable().optional(),

  mapY: z.number().min(0).max(100).nullable().optional(),

  campId: z.string().trim().min(1, "Camp is required."),

  spatialZone: z.nativeEnum(SpatialZone),

  shadeLevel: z.coerce.number().finite().min(0).max(100),

  terrainSlope: z.coerce.number().finite().min(0).max(100),

  noiseLevel: z.coerce.number().finite().min(1).max(10),

  recommendedFor: z.nativeEnum(UserType),
});

/* ========================================================================== */
/* CREATE LISTING                                                             */
/* ========================================================================== */

export async function createListing(
  values: z.infer<typeof listingFormSchema>
): Promise<FormState> {
  try {
    console.log("========================================");
    console.log("CREATE LISTING START");
    console.log("VALUES RECEIVED:", values);

    /* AUTH */

    const session = await auth();

    console.log("SESSION:", {
      userId: session?.user?.id ?? null,
      role: session?.user?.role ?? null,
    });

    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in.",
      };
    }

    if (session.user.role !== Role.PROVIDER) {
      return {
        success: false,
        message: "Only providers can create accommodations.",
      };
    }

    const userId = session.user.id;

    /* VALIDATION */

    const validatedFields =
      listingFormSchema.safeParse(values);

    if (!validatedFields.success) {
      console.error(
        "LISTING VALIDATION FAILED:",
        validatedFields.error.issues
      );

      const validationMessage =
        validatedFields.error.issues
          .map((issue) => {
            const field = issue.path.join(".");

            return `${
              field || "field"
            }: ${issue.message}`;
          })
          .join(", ");

      return {
        success: false,
        message: `Invalid data: ${validationMessage}`,
      };
    }

    const data = validatedFields.data;

    console.log("LISTING VALIDATION PASSED");

    /* ==================================================================== */
    /* PROVIDER USER - OVO JE ISPRAVLJENI DIO                              */
    /* ==================================================================== */

    const providerUser =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          role: true,
          status: true,
        },
      });

    console.log(
      "PROVIDER USER:",
      providerUser
    );

    if (!providerUser) {
      return {
        success: false,
        message:
          "Provider user account was not found.",
      };
    }

    if (
      providerUser.role !==
      Role.PROVIDER
    ) {
      return {
        success: false,
        message:
          "Only provider accounts can create accommodations.",
      };
    }

    if (
      providerUser.status !==
      UserStatus.APPROVED
    ) {
      return {
        success: false,
        message:
          "Your provider account must be approved before adding accommodations.",
      };
    }

    /* CAMP */

    const camp =
      await prisma.camp.findFirst({
        where: {
          id: data.campId,
          ownerId: userId,
        },
        select: {
          id: true,
          name: true,
        },
      });

    console.log("CAMP:", camp);

    if (!camp) {
      return {
        success: false,
        message:
          "The selected camp does not exist or does not belong to you.",
      };
    }

    /* AMENITIES */

    const uniqueAmenityIds =
      Array.from(
        new Set(data.amenities)
      );

    if (
      uniqueAmenityIds.length >
      0
    ) {
      const existingAmenities =
        await prisma.amenity.findMany({
          where: {
            id: {
              in: uniqueAmenityIds,
            },
          },
          select: {
            id: true,
          },
        });

      if (
        existingAmenities.length !==
        uniqueAmenityIds.length
      ) {
        return {
          success: false,
          message:
            "One or more selected amenities do not exist.",
        };
      }
    }

    /* POIS */

    const pointsOfInterest =
      await prisma.campPointOfInterest.findMany({
        where: {
          campId: data.campId,
        },
      });

    const beach =
      pointsOfInterest.find(
        (point) =>
          point.type ===
          PointOfInterestType.BEACH
      );

    const toilet =
      pointsOfInterest.find(
        (point) =>
          point.type ===
          PointOfInterestType.TOILET
      );

    const parking =
      pointsOfInterest.find(
        (point) =>
          point.type ===
          PointOfInterestType.PARKING
      );

    /* DISTANCES */

    const distanceToBeach =
      beach
        ? calculateDistanceMeters(
            data.lat,
            data.lng,
            beach.lat,
            beach.lng
          )
        : null;

    const distanceToToilet =
      toilet
        ? calculateDistanceMeters(
            data.lat,
            data.lng,
            toilet.lat,
            toilet.lng
          )
        : null;

    const distanceToParking =
      parking
        ? calculateDistanceMeters(
            data.lat,
            data.lng,
            parking.lat,
            parking.lng
          )
        : null;

    console.log(
      "CALCULATED DISTANCES:",
      {
        distanceToBeach,
        distanceToToilet,
        distanceToParking,
      }
    );

    /* MAP */

    const finalMapX =
      data.mapX == null
        ? null
        : Math.round(
            data.mapX
          );

    const finalMapY =
      data.mapY == null
        ? null
        : Math.round(
            data.mapY
          );

    /* CREATE */

    const newListing =
      await prisma.$transaction(
        async (
          tx: Prisma.TransactionClient
        ) => {
          const listing =
            await tx.listing.create({
              data: {
                title:
                  data.title,

                description:
                  data.description,

                address:
                  data.address,

                city:
                  data.city,

                price:
                  data.price,

                type:
                  data.type,

                capacity:
                  data.capacity,

                status:
                  ListingStatus.PENDING,

                isAvailable:
                  true,

                providerId:
                  userId,

                lat:
                  data.lat,

                lng:
                  data.lng,

                mapX:
                  finalMapX,

                mapY:
                  finalMapY,

                campId:
                  data.campId,

                spatialZone:
                  data.spatialZone,

                distanceToBeach,
                distanceToToilet,
                distanceToParking,

                shadeLevel:
                  data.shadeLevel,

                terrainSlope:
                  data.terrainSlope,

                noiseLevel:
                  data.noiseLevel,

                recommendedFor:
                  data.recommendedFor,

                image:
                  data.photos[0] ??
                  null,
              },
            });

          console.log(
            "BASE LISTING CREATED:",
            listing.id
          );

          if (
            uniqueAmenityIds.length >
            0
          ) {
            await tx.listingAmenity.createMany({
              data:
                uniqueAmenityIds.map(
                  (
                    amenityId
                  ) => ({
                    listingId:
                      listing.id,

                    amenityId,
                  })
                ),

              skipDuplicates:
                true,
            });
          }

          await tx.photo.createMany({
            data:
              data.photos.map(
                (
                  url,
                  index
                ) => ({
                  listingId:
                    listing.id,

                  url,

                  isCover:
                    index === 0,
                })
              ),
          });

          return listing;
        }
      );

    console.log(
      "LISTING CREATED SUCCESSFULLY:",
      {
        id: newListing.id,
        title:
          newListing.title,
      }
    );

    revalidatePath(
      "/provider/dashboard"
    );

    revalidatePath(
      "/accommodation"
    );

    revalidatePath(
      "/listings"
    );

    revalidatePath(
      "/map"
    );

    revalidatePath(
      "/smart-search"
    );

    revalidatePath(
      `/listing/${newListing.id}`
    );

    console.log(
      "CREATE LISTING END"
    );

    console.log(
      "========================================"
    );

    return {
      success: true,
      message:
        "Accommodation created successfully and is awaiting admin approval.",
    };
  } catch (error) {
    console.error(
      "========================================"
    );

    console.error(
      "CREATE LISTING FAILED:"
    );

    console.error(error);

    if (
      error instanceof Error
    ) {
      console.error(
        "ERROR NAME:",
        error.name
      );

      console.error(
        "ERROR MESSAGE:",
        error.message
      );

      console.error(
        "ERROR STACK:",
        error.stack
      );

      return {
        success: false,

        message:
          `Failed to create listing: ${error.message}`,
      };
    }

    return {
      success: false,
      message:
        "Failed to create listing: Unknown server error.",
    };
  }
}

/* ========================================================================== */
/* UPDATE LISTING                                                             */
/* ========================================================================== */

export async function updateListing(
  listingId: string,
  formData: FormData
): Promise<void> {
  const session =
    await auth();

  if (
    !session?.user?.id ||
    session.user.role !==
      Role.PROVIDER
  ) {
    throw new Error(
      "Unauthorized"
    );
  }

  const title =
    String(
      formData.get("title") ??
        ""
    ).trim();

  const description =
    String(
      formData.get(
        "description"
      ) ?? ""
    ).trim();

  const address =
    String(
      formData.get(
        "address"
      ) ?? ""
    ).trim();

  const city =
    String(
      formData.get("city") ??
        ""
    ).trim();

  const price =
    Number(
      formData.get("price")
    );

  const capacity =
    Number(
      formData.get(
        "capacity"
      )
    );

  const type =
    String(
      formData.get("type") ??
        ""
    ) as AccommodationType;

  const amenityIds =
    formData
      .getAll("amenities")
      .map(String)
      .filter(Boolean);

  const photoUrls =
    formData
      .getAll("photos")
      .map(String)
      .map((url) =>
        url.trim()
      )
      .filter(Boolean)
      .slice(0, 5);

  const latRaw =
    String(
      formData.get("lat") ??
        ""
    ).trim();

  const lngRaw =
    String(
      formData.get("lng") ??
        ""
    ).trim();

  const lat =
    latRaw !== ""
      ? Number(latRaw)
      : null;

  const lng =
    lngRaw !== ""
      ? Number(lngRaw)
      : null;

  const mapXRaw =
    String(
      formData.get("mapX") ??
        ""
    ).trim();

  const mapYRaw =
    String(
      formData.get("mapY") ??
        ""
    ).trim();

  const mapX =
    mapXRaw !== ""
      ? Number(mapXRaw)
      : null;

  const mapY =
    mapYRaw !== ""
      ? Number(mapYRaw)
      : null;

  const campId =
    String(
      formData.get("campId") ??
        ""
    ).trim();

  const spatialZoneRaw =
    String(
      formData.get(
        "spatialZone"
      ) ?? ""
    ).trim();

  const recommendedForRaw =
    String(
      formData.get(
        "recommendedFor"
      ) ?? ""
    ).trim();

  const shadeRaw =
    String(
      formData.get(
        "shadeLevel"
      ) ?? ""
    ).trim();

  const slopeRaw =
    String(
      formData.get(
        "terrainSlope"
      ) ?? ""
    ).trim();

  const noiseRaw =
    String(
      formData.get(
        "noiseLevel"
      ) ?? ""
    ).trim();

  const shadeLevel =
    shadeRaw !== ""
      ? Number(shadeRaw)
      : null;

  const terrainSlope =
    slopeRaw !== ""
      ? Number(slopeRaw)
      : null;

  const noiseLevel =
    noiseRaw !== ""
      ? Number(noiseRaw)
      : null;

  if (
    !title ||
    !description ||
    !address ||
    !city ||
    !type ||
    !campId ||
    !Number.isFinite(price) ||
    price <= 0 ||
    !Number.isInteger(capacity) ||
    capacity <= 0
  ) {
    throw new Error(
      "Missing or invalid required fields."
    );
  }

  if (
    lat === null ||
    !Number.isFinite(lat) ||
    lat < -90 ||
    lat > 90
  ) {
    throw new Error(
      "A valid accommodation latitude is required."
    );
  }

  if (
    lng === null ||
    !Number.isFinite(lng) ||
    lng < -180 ||
    lng > 180
  ) {
    throw new Error(
      "A valid accommodation longitude is required."
    );
  }

  if (
    !Object.values(
      SpatialZone
    ).includes(
      spatialZoneRaw as SpatialZone
    )
  ) {
    throw new Error(
      "Invalid spatial zone."
    );
  }

  if (
    !Object.values(
      UserType
    ).includes(
      recommendedForRaw as UserType
    )
  ) {
    throw new Error(
      "Invalid recommended user type."
    );
  }

  if (
    shadeLevel === null ||
    !Number.isFinite(
      shadeLevel
    ) ||
    shadeLevel < 0 ||
    shadeLevel > 100
  ) {
    throw new Error(
      "Shade level must be between 0 and 100."
    );
  }

  if (
    terrainSlope === null ||
    !Number.isFinite(
      terrainSlope
    ) ||
    terrainSlope < 0 ||
    terrainSlope > 100
  ) {
    throw new Error(
      "Terrain slope must be between 0 and 100."
    );
  }

  if (
    noiseLevel === null ||
    !Number.isFinite(
      noiseLevel
    ) ||
    noiseLevel < 1 ||
    noiseLevel > 10
  ) {
    throw new Error(
      "Noise level must be between 1 and 10."
    );
  }

  const spatialZone =
    spatialZoneRaw as SpatialZone;

  const recommendedFor =
    recommendedForRaw as UserType;

  const existingListing =
    await prisma.listing.findUnique({
      where: {
        id: listingId,
      },
      select: {
        providerId: true,
      },
    });

  if (
    !existingListing ||
    existingListing.providerId !==
      session.user.id
  ) {
    throw new Error(
      "Forbidden: You do not own this listing."
    );
  }

  const camp =
    await prisma.camp.findFirst({
      where: {
        id: campId,
        ownerId:
          session.user.id,
      },
      select: {
        id: true,
      },
    });

  if (!camp) {
    throw new Error(
      "The selected camp does not exist or does not belong to you."
    );
  }

  const pointsOfInterest =
    await prisma.campPointOfInterest.findMany({
      where: {
        campId,
      },
    });

  const beach =
    pointsOfInterest.find(
      (point) =>
        point.type ===
        PointOfInterestType.BEACH
    );

  const toilet =
    pointsOfInterest.find(
      (point) =>
        point.type ===
        PointOfInterestType.TOILET
    );

  const parking =
    pointsOfInterest.find(
      (point) =>
        point.type ===
        PointOfInterestType.PARKING
    );

  const distanceToBeach =
    beach
      ? calculateDistanceMeters(
          lat,
          lng,
          beach.lat,
          beach.lng
        )
      : null;

  const distanceToToilet =
    toilet
      ? calculateDistanceMeters(
          lat,
          lng,
          toilet.lat,
          toilet.lng
        )
      : null;

  const distanceToParking =
    parking
      ? calculateDistanceMeters(
          lat,
          lng,
          parking.lat,
          parking.lng
        )
      : null;

  try {
    await prisma.$transaction(
      async (
        tx: Prisma.TransactionClient
      ) => {
        await tx.listing.update({
          where: {
            id: listingId,
          },

          data: {
            title,
            description,
            address,
            city,

            price,
            type,
            capacity,

            lat,
            lng,

            mapX:
              mapX === null
                ? null
                : Math.round(mapX),

            mapY:
              mapY === null
                ? null
                : Math.round(mapY),

            campId,

            distanceToBeach,
            distanceToToilet,
            distanceToParking,

            spatialZone,
            shadeLevel,
            terrainSlope,
            noiseLevel,
            recommendedFor,

            status:
              ListingStatus.PENDING,

            image:
              photoUrls[0] ??
              null,
          },
        });

        await tx.listingAmenity.deleteMany({
          where: {
            listingId,
          },
        });

        if (
          amenityIds.length >
          0
        ) {
          await tx.listingAmenity.createMany({
            data:
              amenityIds.map(
                (
                  amenityId
                ) => ({
                  listingId,
                  amenityId,
                })
              ),

            skipDuplicates:
              true,
          });
        }

        await tx.photo.deleteMany({
          where: {
            listingId,
          },
        });

        if (
          photoUrls.length >
          0
        ) {
          await tx.photo.createMany({
            data:
              photoUrls.map(
                (
                  url,
                  index
                ) => ({
                  listingId,
                  url,
                  isCover:
                    index === 0,
                })
              ),
          });
        }
      }
    );
  } catch (error) {
    console.error(
      "Error updating listing:",
      error
    );

    throw new Error(
      error instanceof Error
        ? `Failed to update listing: ${error.message}`
        : "Failed to update listing."
    );
  }

  revalidatePath(
    "/provider/dashboard"
  );

  revalidatePath(
    "/accommodation"
  );

  revalidatePath(
    "/listings"
  );

  revalidatePath(
    `/listing/${listingId}`
  );

  revalidatePath(
    "/map"
  );

  revalidatePath(
    "/smart-search"
  );

  redirect(
    "/provider/dashboard"
  );
}

/* ========================================================================== */
/* DELETE LISTING                                                             */
/* ========================================================================== */

export async function deleteListing(
  listingId: string,
  _formData: FormData
): Promise<void> {
  const session =
    await auth();

  if (
    !session?.user?.id ||
    session.user.role !==
      Role.PROVIDER
  ) {
    throw new Error(
      "Not authorized."
    );
  }

  const listing =
    await prisma.listing.findUnique({
      where: {
        id: listingId,
      },
      select: {
        providerId: true,
      },
    });

  if (!listing) {
    throw new Error(
      "Listing was not found."
    );
  }

  if (
    listing.providerId !==
      session.user.id
  ) {
    throw new Error(
      "Forbidden: You do not own this listing."
    );
  }

  try {
    await prisma.listing.delete({
      where: {
        id: listingId,
      },
    });

    revalidatePath(
      "/provider/dashboard"
    );

    revalidatePath(
      "/accommodation"
    );

    revalidatePath(
      "/listings"
    );

    revalidatePath(
      "/map"
    );

    revalidatePath(
      "/smart-search"
    );
  } catch (error) {
    console.error(
      "Error deleting listing:",
      error
    );

    throw new Error(
      "Failed to delete listing."
    );
  }
}

/* ========================================================================== */
/* PROVIDER PROFILE                                                           */
/* ========================================================================== */

export async function updateProviderProfile(
  formData: FormData
): Promise<void> {
  const session =
    await auth();

  if (
    !session?.user?.id ||
    session.user.role !==
      Role.PROVIDER
  ) {
    throw new Error(
      "Unauthorized"
    );
  }

  const name =
    String(
      formData.get("name") ??
        ""
    ).trim();

  const phone =
    String(
      formData.get("phone") ??
        ""
    ).trim();

  const address =
    String(
      formData.get(
        "address"
      ) ?? ""
    ).trim();

  if (
    !name ||
    !phone ||
    !address
  ) {
    throw new Error(
      "Name, phone and address are required."
    );
  }

  const provider =
    await prisma.provider.findUnique({
      where: {
        userId:
          session.user.id,
      },
      select: {
        id: true,
      },
    });

  if (!provider) {
    throw new Error(
      "Provider profile was not found."
    );
  }

  await prisma.$transaction(
    async (
      tx: Prisma.TransactionClient
    ) => {
      await tx.user.update({
        where: {
          id:
            session.user.id,
        },

        data: {
          name,
        },
      });

      await tx.provider.update({
        where: {
          userId:
            session.user.id,
        },

        data: {
          phone,
          address,
        },
      });
    }
  );

  revalidatePath(
    "/provider/profile"
  );

  revalidatePath(
    "/provider/dashboard"
  );
}

/* ========================================================================== */
/* PROVIDER PASSWORD                                                          */
/* ========================================================================== */

export async function updateProviderPassword(
  formData: FormData
): Promise<FormState> {
  try {
    const session =
      await auth();

    if (
      !session?.user?.id ||
      session.user.role !==
        Role.PROVIDER
    ) {
      return {
        success: false,
        message:
          "Not authorized.",
      };
    }

    const currentPassword =
      String(
        formData.get(
          "currentPassword"
        ) ?? ""
      );

    const newPassword =
      String(
        formData.get(
          "newPassword"
        ) ?? ""
      );

    if (
      !currentPassword ||
      !newPassword
    ) {
      return {
        success: false,
        message:
          "All fields are required.",
      };
    }

    if (
      newPassword.length <
      8
    ) {
      return {
        success: false,
        message:
          "The new password must be at least 8 characters long.",
      };
    }

    const user =
      await prisma.user.findUnique({
        where: {
          id:
            session.user.id,
        },

        select: {
          password: true,
        },
      });

    if (!user?.password) {
      return {
        success: false,
        message:
          "User account was not found.",
      };
    }

    const passwordIsCorrect =
      await bcryptjs.compare(
        currentPassword,
        user.password
      );

    if (
      !passwordIsCorrect
    ) {
      return {
        success: false,
        message:
          "The current password is incorrect.",
      };
    }

    const hashedPassword =
      await bcryptjs.hash(
        newPassword,
        SALT_ROUNDS
      );

    await prisma.user.update({
      where: {
        id:
          session.user.id,
      },

      data: {
        password:
          hashedPassword,
      },
    });

    revalidatePath(
      "/provider/settings"
    );

    return {
      success: true,
      message:
        "Password updated successfully.",
    };
  } catch (error) {
    console.error(
      "Error updating provider password:",
      error
    );

    return {
      success: false,
      message:
        "Failed to update password.",
    };
  }
}

/* ========================================================================== */
/* PUBLIC LISTING ACTIONS                                                     */
/* ========================================================================== */

export async function getRandomListings(
  limit = 10
) {
  try {
    const safeLimit =
      Math.min(
        Math.max(
          limit,
          1
        ),
        50
      );

    const listings =
      await prisma.listing.findMany({
        where: {
          status:
            ListingStatus.APPROVED,

          isAvailable:
            true,
        },

        take:
          safeLimit,

        orderBy: {
          createdAt:
            "desc",
        },

        include: {
          photos: true,

          camp: true,

          amenities: {
            include: {
              amenity:
                true,
            },
          },
        },
      });

    return listings.sort(
      () =>
        Math.random() -
        0.5
    );
  } catch (error) {
    console.error(
      "Error fetching random listings:",
      error
    );

    return [];
  }
}

export async function searchListings(
  query: string
) {
  const normalizedQuery =
    query.trim();

  if (!normalizedQuery) {
    return [];
  }

  try {
    return await prisma.listing.findMany({
      where: {
        status:
          ListingStatus.APPROVED,

        isAvailable:
          true,

        OR: [
          {
            city: {
              contains:
                normalizedQuery,

              mode:
                "insensitive",
            },
          },

          {
            title: {
              contains:
                normalizedQuery,

              mode:
                "insensitive",
            },
          },

          {
            address: {
              contains:
                normalizedQuery,

              mode:
                "insensitive",
            },
          },

          {
            description: {
              contains:
                normalizedQuery,

              mode:
                "insensitive",
            },
          },
        ],
      },

      orderBy: {
        createdAt:
          "desc",
      },

      take: 20,

      include: {
        photos: true,

        camp: true,

        amenities: {
          include: {
            amenity:
              true,
          },
        },
      },
    });
  } catch (error) {
    console.error(
      "Error searching listings:",
      error
    );

    return [];
  }
}