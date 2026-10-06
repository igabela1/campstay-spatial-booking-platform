"use client";

import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

import {
  AccommodationType,
  Amenity,
  Camp,
} from "@prisma/client";

import { createListing } from "@/lib/actions";
import { MapPositionPicker } from "@/components/map-position-picker";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ========================================================= */
/* CONSTANTS                                                 */
/* ========================================================= */

const spatialZoneValues = [
  "FAMILY",
  "QUIET",
  "ADVENTURE",
  "BEACH",
  "CENTRAL",
] as const;

const userTypeValues = [
  "FAMILY",
  "CAMPER",
  "BACKPACKER",
  "DIGITAL_NOMAD",
] as const;

/* ========================================================= */
/* LOCATION PICKER                                           */
/* ========================================================= */

const LocationPicker = dynamic(
  () => import("@/components/ui/LocationPicker"),
  {
    ssr: false,

    loading: () => (
      <div className="flex h-96 w-full items-center justify-center rounded-md bg-muted">
        <p className="text-sm text-muted-foreground">
          Loading geographic map...
        </p>
      </div>
    ),
  }
);

/* ========================================================= */
/* VALIDATION                                                */
/* ========================================================= */

const listingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Accommodation name is required."),

  description: z
    .string()
    .trim()
    .min(1, "Description is required."),

  address: z
    .string()
    .trim()
    .min(1, "Address is required."),

  city: z
    .string()
    .trim()
    .min(1, "City is required."),

  price: z.coerce
    .number()
    .min(1, "Price must be greater than 0."),

  type: z.nativeEnum(AccommodationType),

  capacity: z.coerce
    .number()
    .int()
    .min(1, "Capacity must be at least 1."),

  amenities: z
    .array(z.string())
    .default([]),

  lat: z.coerce
    .number()
    .min(-90, "Invalid latitude.")
    .max(90, "Invalid latitude."),

  lng: z.coerce
    .number()
    .min(-180, "Invalid longitude.")
    .max(180, "Invalid longitude."),

  photos: z
    .array(z.string())
    .min(1, "At least one photo is required.")
    .max(5, "Maximum 5 photos are allowed."),

  campId: z
    .string()
    .trim()
    .min(1, "Camp is required."),

  spatialZone: z.enum(
    spatialZoneValues
  ),

  shadeLevel: z.coerce
    .number()
    .int()
    .min(0, "Shade must be between 0 and 100.")
    .max(100, "Shade must be between 0 and 100."),

  terrainSlope: z.coerce
    .number()
    .int()
    .min(0)
    .max(100),

  noiseLevel: z.coerce
    .number()
    .int()
    .min(1, "Noise must be between 1 and 10.")
    .max(10, "Noise must be between 1 and 10."),

  recommendedFor: z.enum(
    userTypeValues
  ),
});

type ListingFormValues =
  z.infer<typeof listingSchema>;

type NewListingFormProps = {
  amenities: Amenity[];
  camps: Camp[];
};

/* ========================================================= */
/* COMPONENT                                                 */
/* ========================================================= */

export function NewListingForm({
  amenities,
  camps,
}: NewListingFormProps) {
  const router = useRouter();

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [previewUrls, setPreviewUrls] =
    useState<string[]>([]);

  const [mapX, setMapX] =
    useState<number | null>(null);

  const [mapY, setMapY] =
    useState<number | null>(null);

  const [visibleErrors, setVisibleErrors] =
    useState<string[]>([]);

  /* ======================================================= */
  /* DEFAULT CAMP                                            */
  /* ======================================================= */

  const defaultCamp =
    camps[0] ?? null;

  /* ======================================================= */
  /* FORM                                                    */
  /* ======================================================= */

  const form =
    useForm<ListingFormValues>({
      resolver:
        zodResolver(
          listingSchema
        ),

      defaultValues: {
        title: "",

        description: "",

        address:
          defaultCamp?.address ??
          "",

        city:
          defaultCamp?.city ??
          "",

        price: 0,

        type:
          AccommodationType.TENT_PITCH,

        capacity: 2,

        amenities: [],

        lat:
          defaultCamp?.lat ??
          43.6887,

        lng:
          defaultCamp?.lng ??
          17.8295,

        photos: [],

        campId:
          defaultCamp?.id ??
          "",

        spatialZone:
          "CENTRAL",

        shadeLevel: 50,

        terrainSlope: 0,

        noiseLevel: 3,

        recommendedFor:
          "FAMILY",
      },
    });

  /* ======================================================= */
  /* WATCH                                                   */
  /* ======================================================= */

  const currentLat =
    form.watch("lat");

  const currentLng =
    form.watch("lng");

  const selectedCampId =
    form.watch("campId");

  const selectedCamp =
    camps.find(
      (camp) =>
        camp.id ===
        selectedCampId
    ) ?? defaultCamp;

  /* ======================================================= */
  /* UPLOAD PHOTOS                                           */
  /* ======================================================= */

  const handleFileUpload =
    async (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const files =
        event.target.files
          ? Array.from(
              event.target.files
            )
          : [];

      if (
        files.length === 0
      ) {
        return;
      }

      if (
        previewUrls.length +
          files.length >
        5
      ) {
        toast.error(
          "You can upload a maximum of 5 photos."
        );

        event.target.value =
          "";

        return;
      }

      setUploading(true);

      try {
        const formData =
          new FormData();

        files.forEach(
          (file) => {
            formData.append(
              "photos",
              file
            );
          }
        );

        const response =
          await fetch(
            "/api/upload",
            {
              method:
                "POST",

              body:
                formData,
            }
          );

        if (
          !response.ok
        ) {
          const errorText =
            await response.text();

          console.error(
            "UPLOAD ERROR RESPONSE:",
            errorText
          );

          toast.error(
            "Photo upload failed."
          );

          return;
        }

        const data:
          {
            urls?: string[];
          } =
          await response.json();

        const uploadedUrls =
          data.urls ?? [];

        if (
          uploadedUrls.length ===
          0
        ) {
          toast.error(
            "No photo URLs were returned."
          );

          return;
        }

        const updatedUrls = [
          ...previewUrls,
          ...uploadedUrls,
        ];

        setPreviewUrls(
          updatedUrls
        );

        form.setValue(
          "photos",
          updatedUrls,
          {
            shouldDirty: true,
            shouldValidate: true,
          }
        );

        form.clearErrors(
          "photos"
        );

        toast.success(
          `${uploadedUrls.length} photo(s) uploaded successfully.`
        );
      } catch (
        error
      ) {
        console.error(
          "PHOTO UPLOAD ERROR:",
          error
        );

        toast.error(
          "Photo upload failed."
        );
      } finally {
        setUploading(
          false
        );

        event.target.value =
          "";
      }
    };

  /* ======================================================= */
  /* REMOVE PHOTO                                            */
  /* ======================================================= */

  const removePhoto = (
    index: number
  ) => {
    const updatedUrls =
      previewUrls.filter(
        (_, currentIndex) =>
          currentIndex !== index
      );

    setPreviewUrls(
      updatedUrls
    );

    form.setValue(
      "photos",
      updatedUrls,
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );
  };

  /* ======================================================= */
  /* DIRECT SAVE                                             */
  /* ======================================================= */

  const handleDirectSave =
    async () => {
      console.log(
        "================================"
      );

      console.log(
        "DIRECT SAVE BUTTON CLICKED"
      );

      console.log(
        "================================"
      );

      if (saving) {
        return;
      }

      if (uploading) {
        toast.error(
          "Please wait until the photo upload finishes."
        );

        return;
      }

      /*
        Uzmi trenutne vrijednosti
        direktno iz React Hook Form-a.
      */

      const rawValues =
        form.getValues();

      /*
        Photo state eksplicitno
        dodajemo ovdje kako ne bismo
        zavisili od stanja forme.
      */

      const valuesForValidation = {
        ...rawValues,

        photos:
          previewUrls,
      };

      console.log(
        "RAW FORM VALUES:",
        valuesForValidation
      );

      /*
        Direktna Zod validacija.

        Ne koristimo:
        form.handleSubmit()
      */

      const validationResult =
        listingSchema.safeParse(
          valuesForValidation
        );

      /* --------------------------------------------------- */
      /* VALIDATION FAILED                                   */
      /* --------------------------------------------------- */

      if (
        !validationResult.success
      ) {
        console.error(
          "CLIENT VALIDATION FAILED:"
        );

        console.error(
          validationResult.error.issues
        );

        const errors =
          validationResult.error.issues.map(
            (issue) => {
              const field =
                issue.path.join(
                  "."
                );

              return `${
                field ||
                "Form"
              }: ${
                issue.message
              }`;
            }
          );

        setVisibleErrors(
          errors
        );

        toast.error(
          "Accommodation cannot be saved. Check the errors at the top."
        );

        window.scrollTo({
          top: 0,
          behavior:
            "smooth",
        });

        return;
      }

      /* --------------------------------------------------- */
      /* VALIDATION OK                                       */
      /* --------------------------------------------------- */

      setVisibleErrors(
        []
      );

      const valuesToSave = {
        ...validationResult.data,

        /*
          mapX/mapY ostaju
          null ako provider nije
          kliknuo camp layout.

          Ako klikne, za trenutni
          Prisma Int ih zaokružujemo.
        */

        mapX:
          mapX === null
            ? null
            : Math.round(
                mapX
              ),

        mapY:
          mapY === null
            ? null
            : Math.round(
                mapY
              ),
      };

      console.log(
        "VALIDATED DATA:"
      );

      console.log(
        validationResult.data
      );

      console.log(
        "DATA SENT TO createListing:"
      );

      console.log(
        valuesToSave
      );

      setSaving(true);

      toast.loading(
        "Saving accommodation...",
        {
          id:
            "create-listing",
        }
      );

      try {
        /*
          OVDJE SE POZIVA
          BACKEND SERVER ACTION.
        */

        const result =
          await createListing(
            valuesToSave as any
          );

        console.log(
          "CREATE LISTING SERVER RESULT:"
        );

        console.log(
          result
        );

        toast.dismiss(
          "create-listing"
        );

        /* ------------------------------------------------- */
        /* SUCCESS                                           */
        /* ------------------------------------------------- */

        if (
          result?.success
        ) {
          toast.success(
            "Accommodation created successfully. It is awaiting admin approval."
          );

          router.push(
            "/provider/dashboard"
          );

          router.refresh();

          return;
        }

        /* ------------------------------------------------- */
        /* BACKEND REJECTED                                  */
        /* ------------------------------------------------- */

        const message =
          result?.message ??
          "Server could not create the accommodation.";

        console.error(
          "SERVER REJECTED LISTING:",
          result
        );

        toast.error(
          message
        );

        setSaving(
          false
        );
      } catch (
        error
      ) {
        toast.dismiss(
          "create-listing"
        );

        console.error(
          "================================"
        );

        console.error(
          "CREATE LISTING REQUEST FAILED:"
        );

        console.error(
          error
        );

        console.error(
          "================================"
        );

        toast.error(
          "Saving failed. Check the terminal for the exact error."
        );

        setSaving(
          false
        );
      }
    };

  /* ======================================================= */
  /* UI                                                      */
  /* ======================================================= */

  return (
    <div className="space-y-6">
      {/* =================================================== */}
      {/* VALIDATION ERRORS                                   */}
      {/* =================================================== */}

      {visibleErrors.length >
        0 && (
        <div className="rounded-lg border border-red-500 bg-red-50 p-5 text-red-900">
          <p className="font-semibold">
            Accommodation
            cannot be saved.
          </p>

          <p className="mt-1 text-sm">
            Please correct
            these fields:
          </p>

          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            {visibleErrors.map(
              (
                error,
                index
              ) => (
                <li
                  key={
                    index
                  }
                >
                  {
                    error
                  }
                </li>
              )
            )}
          </ul>
        </div>
      )}

      <Form {...form}>
        <form
          className="space-y-8"
          noValidate
          onSubmit={(
            event
          ) => {
            /*
              Sprečavamo browser
              submit/refresh.

              Save dugme ispod
              direktno poziva
              handleDirectSave().
            */

            event.preventDefault();
          }}
        >
          {/* ================================================= */}
          {/* ACCOMMODATION INFORMATION                         */}
          {/* ================================================= */}

          <Card>
            <CardHeader>
              <CardTitle>
                Accommodation
                Information
              </CardTitle>

              <CardDescription>
                Enter basic
                information
                about this
                accommodation.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* CAMP */}

              <FormField
                control={
                  form.control
                }
                name="campId"
                render={({
                  field,
                }) => (
                  <FormItem>
                    <FormLabel>
                      Camp
                    </FormLabel>

                    <Select
                      value={
                        field.value
                      }
                      onValueChange={(
                        value
                      ) => {
                        field.onChange(
                          value
                        );

                        const camp =
                          camps.find(
                            (
                              item
                            ) =>
                              item.id ===
                              value
                          );

                        if (
                          !camp
                        ) {
                          return;
                        }

                        form.setValue(
                          "lat",
                          camp.lat,
                          {
                            shouldDirty:
                              true,
                          }
                        );

                        form.setValue(
                          "lng",
                          camp.lng,
                          {
                            shouldDirty:
                              true,
                          }
                        );

                        form.setValue(
                          "address",
                          camp.address,
                          {
                            shouldDirty:
                              true,
                          }
                        );

                        form.setValue(
                          "city",
                          camp.city,
                          {
                            shouldDirty:
                              true,
                          }
                        );

                        setMapX(
                          null
                        );

                        setMapY(
                          null
                        );
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select camp" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {camps.map(
                          (
                            camp
                          ) => (
                            <SelectItem
                              key={
                                camp.id
                              }
                              value={
                                camp.id
                              }
                            >
                              {
                                camp.name
                              }
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* NAME */}

              <FormField
                control={
                  form.control
                }
                name="title"
                render={({
                  field,
                }) => (
                  <FormItem>
                    <FormLabel>
                      Accommodation
                      Name
                    </FormLabel>

                    <FormControl>
                      <Input
                        placeholder="Bungalow 1"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* DESCRIPTION */}

              <FormField
                control={
                  form.control
                }
                name="description"
                render={({
                  field,
                }) => (
                  <FormItem>
                    <FormLabel>
                      Description
                    </FormLabel>

                    <FormControl>
                      <Textarea
                        rows={
                          5
                        }
                        placeholder="Describe the accommodation..."
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* TYPE CAPACITY PRICE */}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={
                    form.control
                  }
                  name="type"
                  render={({
                    field,
                  }) => (
                    <FormItem>
                      <FormLabel>
                        Accommodation
                        Type
                      </FormLabel>

                      <Select
                        value={
                          field.value
                        }
                        onValueChange={
                          field.onChange
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          <SelectItem value="TENT_PITCH">
                            Tent Pitch
                          </SelectItem>

                          <SelectItem value="CAMPER_PITCH">
                            Camper Pitch
                          </SelectItem>

                          <SelectItem value="BUNGALOW">
                            Bungalow
                          </SelectItem>

                          <SelectItem value="APARTMENT">
                            Apartment
                          </SelectItem>

                          <SelectItem value="POOL_COTTAGE">
                            Pool Cottage
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={
                    form.control
                  }
                  name="capacity"
                  render={({
                    field,
                  }) => (
                    <FormItem>
                      <FormLabel>
                        Capacity
                      </FormLabel>

                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={
                    form.control
                  }
                  name="price"
                  render={({
                    field,
                  }) => (
                    <FormItem>
                      <FormLabel>
                        Price per
                        Night (KM)
                      </FormLabel>

                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          step="0.01"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* ================================================= */}
          {/* GEOGRAPHIC LOCATION                               */}
          {/* ================================================= */}

          <Card>
            <CardHeader>
              <CardTitle>
                Geographic
                Location
              </CardTitle>

              <CardDescription>
                Click on the
                map to mark the
                exact geographic
                position.
                Distances to
                beach, toilet
                and parking are
                calculated
                automatically.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={
                    form.control
                  }
                  name="address"
                  render={({
                    field,
                  }) => (
                    <FormItem>
                      <FormLabel>
                        Address
                      </FormLabel>

                      <FormControl>
                        <Input
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={
                    form.control
                  }
                  name="city"
                  render={({
                    field,
                  }) => (
                    <FormItem>
                      <FormLabel>
                        City
                      </FormLabel>

                      <FormControl>
                        <Input
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormLabel>
                  Exact
                  Accommodation
                  Position
                </FormLabel>

                <p className="text-sm text-muted-foreground">
                  Click on the
                  exact location
                  inside the
                  camp.
                </p>

                <LocationPicker
                  latitude={
                    currentLat
                  }
                  longitude={
                    currentLng
                  }
                  onChange={(
                    lat,
                    lng
                  ) => {
                    form.setValue(
                      "lat",
                      lat,
                      {
                        shouldDirty:
                          true,
                      }
                    );

                    form.setValue(
                      "lng",
                      lng,
                      {
                        shouldDirty:
                          true,
                      }
                    );
                  }}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <FormField
                  control={
                    form.control
                  }
                  name="lat"
                  render={({
                    field,
                  }) => (
                    <FormItem>
                      <FormLabel>
                        Latitude
                      </FormLabel>

                      <FormControl>
                        <Input
                          value={
                            field.value ??
                            ""
                          }
                          readOnly
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={
                    form.control
                  }
                  name="lng"
                  render={({
                    field,
                  }) => (
                    <FormItem>
                      <FormLabel>
                        Longitude
                      </FormLabel>

                      <FormControl>
                        <Input
                          value={
                            field.value ??
                            ""
                          }
                          readOnly
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm font-medium">
                  Automatic
                  spatial
                  calculation
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Beach,
                  toilet and
                  parking
                  distances are
                  calculated
                  automatically
                  using the
                  selected GPS
                  coordinates.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ================================================= */}
          {/* SPATIAL CHARACTERISTICS                           */}
          {/* ================================================= */}

          <Card>
            <CardHeader>
              <CardTitle>
                Spatial
                Characteristics
              </CardTitle>

              <CardDescription>
                These values
                are used by
                Smart Search
                for spatial
                ranking.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* ZONE */}

                <FormField
                  control={
                    form.control
                  }
                  name="spatialZone"
                  render={({
                    field,
                  }) => (
                    <FormItem>
                      <FormLabel>
                        Spatial
                        Zone
                      </FormLabel>

                      <Select
                        value={
                          field.value
                        }
                        onValueChange={
                          field.onChange
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          <SelectItem value="FAMILY">
                            Family
                            Zone
                          </SelectItem>

                          <SelectItem value="QUIET">
                            Quiet
                            Zone
                          </SelectItem>

                          <SelectItem value="ADVENTURE">
                            Adventure
                            Zone
                          </SelectItem>

                          <SelectItem value="BEACH">
                            Beach
                            Zone
                          </SelectItem>

                          <SelectItem value="CENTRAL">
                            Central
                            Zone
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* RECOMMENDED */}

                <FormField
                  control={
                    form.control
                  }
                  name="recommendedFor"
                  render={({
                    field,
                  }) => (
                    <FormItem>
                      <FormLabel>
                        Recommended
                        For
                      </FormLabel>

                      <Select
                        value={
                          field.value
                        }
                        onValueChange={
                          field.onChange
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          <SelectItem value="FAMILY">
                            Family
                          </SelectItem>

                          <SelectItem value="CAMPER">
                            Camper
                          </SelectItem>

                          <SelectItem value="BACKPACKER">
                            Backpacker
                          </SelectItem>

                          <SelectItem value="DIGITAL_NOMAD">
                            Digital
                            Nomad
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* SHADE */}

                <FormField
                  control={
                    form.control
                  }
                  name="shadeLevel"
                  render={({
                    field,
                  }) => (
                    <FormItem>
                      <FormLabel>
                        Estimated
                        Shade (%)
                      </FormLabel>

                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="5"
                          {...field}
                        />
                      </FormControl>

                      <p className="text-xs text-muted-foreground">
                        0 = no
                        shade,
                        100 =
                        maximum
                        shade.
                      </p>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* TERRAIN */}

                <FormField
                  control={
                    form.control
                  }
                  name="terrainSlope"
                  render={({
                    field,
                  }) => (
                    <FormItem>
                      <FormLabel>
                        Terrain
                      </FormLabel>

                      <Select
                        value={String(
                          field.value
                        )}
                        onValueChange={(
                          value
                        ) => {
                          field.onChange(
                            Number(
                              value
                            )
                          );
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          <SelectItem value="0">
                            Flat
                          </SelectItem>

                          <SelectItem value="5">
                            Slight
                            slope
                          </SelectItem>

                          <SelectItem value="10">
                            Moderate
                            slope
                          </SelectItem>

                          <SelectItem value="20">
                            Steep
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* NOISE */}

                <FormField
                  control={
                    form.control
                  }
                  name="noiseLevel"
                  render={({
                    field,
                  }) => (
                    <FormItem>
                      <FormLabel>
                        Estimated
                        Noise
                        (1–10)
                      </FormLabel>

                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          {...field}
                        />
                      </FormControl>

                      <p className="text-xs text-muted-foreground">
                        1 = very
                        quiet,
                        10 = very
                        noisy.
                      </p>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* ================================================= */}
          {/* CAMP LAYOUT                                       */}
          {/* ================================================= */}

          <Card>
            <CardHeader>
              <CardTitle>
                Position on
                Camp Layout
              </CardTitle>

              <CardDescription>
                Mark the
                approximate
                local position
                of this
                accommodation.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <MapPositionPicker
                imageUrl={
                  selectedCamp?.mapImageUrl ||
                  "/camp-layout.jpg"
                }
                mapX={
                  mapX
                }
                mapY={
                  mapY
                }
                onChange={(
                  x,
                  y
                ) => {
                  setMapX(
                    Math.round(
                      x
                    )
                  );

                  setMapY(
                    Math.round(
                      y
                    )
                  );
                }}
              />

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <FormLabel>
                    Map X
                  </FormLabel>

                  <Input
                    value={
                      mapX ??
                      ""
                    }
                    readOnly
                    placeholder="Click map"
                  />
                </div>

                <div>
                  <FormLabel>
                    Map Y
                  </FormLabel>

                  <Input
                    value={
                      mapY ??
                      ""
                    }
                    readOnly
                    placeholder="Click map"
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setMapX(
                    null
                  );

                  setMapY(
                    null
                  );
                }}
              >
                Reset Layout
                Position
              </Button>
            </CardContent>
          </Card>

          {/* ================================================= */}
          {/* AMENITIES                                         */}
          {/* ================================================= */}

          <Card>
            <CardHeader>
              <CardTitle>
                Amenities
              </CardTitle>

              <CardDescription>
                Select
                amenities
                available for
                this
                accommodation.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <FormField
                control={
                  form.control
                }
                name="amenities"
                render={() => (
                  <FormItem>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      {amenities.map(
                        (
                          item
                        ) => (
                          <FormField
                            key={
                              item.id
                            }
                            control={
                              form.control
                            }
                            name="amenities"
                            render={({
                              field,
                            }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={
                                      field.value?.includes(
                                        item.id
                                      ) ??
                                      false
                                    }
                                    onCheckedChange={(
                                      checked
                                    ) => {
                                      const current =
                                        field.value ??
                                        [];

                                      if (
                                        checked ===
                                        true
                                      ) {
                                        field.onChange(
                                          [
                                            ...current,
                                            item.id,
                                          ]
                                        );
                                      } else {
                                        field.onChange(
                                          current.filter(
                                            (
                                              id
                                            ) =>
                                              id !==
                                              item.id
                                          )
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>

                                <FormLabel className="font-normal">
                                  {
                                    item.name
                                  }
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        )
                      )}
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* ================================================= */}
          {/* PHOTOS                                            */}
          {/* ================================================= */}

          <Card>
            <CardHeader>
              <CardTitle>
                Photos
              </CardTitle>

              <CardDescription>
                Upload up to
                five photos.
                The first one
                becomes the
                cover image.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <div
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition ${
                  uploading
                    ? "cursor-wait opacity-50"
                    : "hover:bg-muted/40"
                }`}
                onClick={() => {
                  if (
                    !uploading
                  ) {
                    document
                      .getElementById(
                        "photoInput"
                      )
                      ?.click();
                  }
                }}
              >
                <input
                  id="photoInput"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={
                    handleFileUpload
                  }
                  className="hidden"
                  disabled={
                    uploading
                  }
                />

                {previewUrls.length ===
                0 ? (
                  <div className="text-center">
                    <p className="font-medium">
                      Click to
                      upload
                      photos
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      JPG, PNG
                      or WEBP —
                      maximum
                      5 photos
                    </p>
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {previewUrls.map(
                        (
                          url,
                          index
                        ) => (
                          <div
                            key={`${url}-${index}`}
                            className="relative overflow-hidden rounded-lg border"
                          >
                            <img
                              src={
                                url
                              }
                              alt={`Accommodation ${
                                index +
                                1
                              }`}
                              className="h-44 w-full object-cover"
                            />

                            <button
                              type="button"
                              className="absolute right-2 top-2 rounded-full bg-black/70 px-2.5 py-1 text-xs text-white"
                              onClick={(
                                event
                              ) => {
                                event.stopPropagation();

                                removePhoto(
                                  index
                                );
                              }}
                            >
                              ✕
                            </button>

                            {index ===
                              0 && (
                              <span className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                                Cover
                              </span>
                            )}
                          </div>
                        )
                      )}
                    </div>

                    {previewUrls.length <
                      5 && (
                      <p className="mt-4 text-center text-sm text-muted-foreground">
                        Click
                        anywhere
                        here to
                        add more
                        photos.
                      </p>
                    )}
                  </div>
                )}

                {uploading && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Uploading...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ================================================= */}
          {/* ACTIONS                                           */}
          {/* ================================================= */}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.back()
              }
              disabled={
                saving ||
                uploading
              }
            >
              Cancel
            </Button>

            {/*

              NAMJERNO NE KORISTIMO:

              type="submit"
              form.handleSubmit()
              useTransition()

              Klik direktno poziva
              handleDirectSave().

            */}

            <button
              type="button"
              onClick={() => {
                console.log(
                  "SAVE BUTTON PHYSICALLY CLICKED"
                );

                void handleDirectSave();
              }}
              disabled={
                saving ||
                uploading
              }
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save and Submit for Review"}
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}