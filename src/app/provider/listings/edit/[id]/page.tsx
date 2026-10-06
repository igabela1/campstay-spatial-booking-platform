import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import EditLocationPicker from "./EditLocationPicker";
import EditPhotosUploader from "./EditPhotosUploader";

import { prisma } from "@/lib/prisma";
import { updateListing } from "@/lib/actions";
import { auth } from "@/auth";

import Link from "next/link";

import {
  notFound,
  redirect,
} from "next/navigation";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id: listingId } = await params;

  /* ====================================================================== */
  /* AUTH                                                                   */
  /* ====================================================================== */

  const session = await auth();
  const providerId = session?.user?.id;

  if (!providerId) {
    redirect("/login");
  }

  /* ====================================================================== */
  /* LOAD DATA                                                              */
  /* ====================================================================== */

  const [
    listing,
    allAmenities,
    camps,
  ] = await Promise.all([
    prisma.listing.findUnique({
      where: {
        id: listingId,
      },

      include: {
        amenities: true,
        photos: true,
        camp: true,
      },
    }),

    prisma.amenity.findMany({
      orderBy: {
        name: "asc",
      },
    }),

    prisma.camp.findMany({
      where: {
        ownerId: providerId,
      },

      orderBy: {
        name: "asc",
      },
    }),
  ]);

  if (!listing) {
    notFound();
  }

  if (listing.providerId !== providerId) {
    redirect("/provider/dashboard");
  }

  /* ====================================================================== */
  /* PREPARE DATA                                                           */
  /* ====================================================================== */

  const listingAmenityIds = new Set(
    listing.amenities.map(
      (amenity) => amenity.amenityId
    )
  );

  const currentCamp =
    listing.camp ??
    camps[0] ??
    null;

  const fallbackLat =
    currentCamp?.lat ??
    43.68819;

  const fallbackLng =
    currentCamp?.lng ??
    17.82955;

  /* ====================================================================== */
  /* PAGE                                                                   */
  /* ====================================================================== */

  return (
    <div className="space-y-6">
      {/* ================================================================== */}
      {/* PAGE HEADER                                                        */}
      {/* ================================================================== */}

      <Card>
        <CardHeader>
          <CardTitle>
            Edit Listing: {listing.title}
          </CardTitle>

          <CardDescription>
            Update accommodation information,
            exact GPS position and spatial
            characteristics.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border border-blue-800 bg-blue-950/30 p-4 text-sm text-blue-200">
            Distances to the beach, toilet and
            parking are calculated automatically
            from geographic coordinates. Move the
            marker to the exact accommodation
            position and describe the local spatial
            characteristics.
          </div>
        </CardContent>
      </Card>

      {/* ================================================================== */}
      {/* FORM                                                               */}
      {/* ================================================================== */}

      <form
        action={updateListing.bind(
          null,
          listing.id
        )}
        className="space-y-8"
      >
        {/* ================================================================ */}
        {/* CAMP                                                             */}
        {/* ================================================================ */}

        <Card>
          <CardHeader>
            <CardTitle>
              Camp
            </CardTitle>

            <CardDescription>
              Select the camp where this
              accommodation is located.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="campId">
                Camp
              </Label>

              <Select
                name="campId"
                defaultValue={
                  listing.campId ??
                  currentCamp?.id ??
                  ""
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a camp" />
                </SelectTrigger>

                <SelectContent>
                  {camps.map((camp) => (
                    <SelectItem
                      key={camp.id}
                      value={camp.id}
                    >
                      {camp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* ================================================================ */}
        {/* BASIC INFORMATION                                                */}
        {/* ================================================================ */}

        <Card>
          <CardHeader>
            <CardTitle>
              Basic Information
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* TITLE */}

            <div className="space-y-2">
              <Label htmlFor="title">
                Listing Title
              </Label>

              <Input
                id="title"
                name="title"
                defaultValue={listing.title}
                required
              />
            </div>

            {/* DESCRIPTION */}

            <div className="space-y-2">
              <Label htmlFor="description">
                Description
              </Label>

              <Textarea
                id="description"
                name="description"
                defaultValue={
                  listing.description
                }
                required
              />
            </div>

            {/* ADDRESS / CITY / PRICE / CAPACITY */}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="address">
                  Full Address
                </Label>

                <Input
                  id="address"
                  name="address"
                  defaultValue={
                    listing.address
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">
                  City
                </Label>

                <Input
                  id="city"
                  name="city"
                  defaultValue={
                    listing.city
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">
                  Price (KM / night)
                </Label>

                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="1"
                  step="0.01"
                  defaultValue={
                    listing.price
                  }
                  required
                />

                <p className="text-xs text-slate-400">
                  Enter the price for one night.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">
                  Capacity
                </Label>

                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  step="1"
                  defaultValue={
                    listing.capacity
                  }
                  required
                />
              </div>
            </div>

            {/* ACCOMMODATION TYPE */}

            <div className="space-y-2">
              <Label htmlFor="type">
                Accommodation Type
              </Label>

              <Select
                name="type"
                defaultValue={
                  listing.type
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select accommodation type" />
                </SelectTrigger>

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
            </div>
          </CardContent>
        </Card>

        {/* ================================================================ */}
        {/* GPS LOCATION                                                     */}
        {/* ================================================================ */}

        <EditLocationPicker
          initialLat={
            listing.lat ??
            fallbackLat
          }
          initialLng={
            listing.lng ??
            fallbackLng
          }
        />

        {/* ================================================================ */}
        {/* AUTOMATIC DISTANCES                                              */}
        {/* ================================================================ */}

        <Card>
          <CardHeader>
            <CardTitle>
              Automatically Calculated Distances
            </CardTitle>

            <CardDescription>
              These distances are calculated from
              the exact GPS position and the saved
              beach, toilet and parking locations.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* BEACH */}

              <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                <p className="text-sm text-slate-400">
                  🏖 Beach
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {listing.distanceToBeach !== null
                    ? `${listing.distanceToBeach} m`
                    : "Not calculated"}
                </p>
              </div>

              {/* TOILET */}

              <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                <p className="text-sm text-slate-400">
                  🚻 Toilet
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {listing.distanceToToilet !== null
                    ? `${listing.distanceToToilet} m`
                    : "Not calculated"}
                </p>
              </div>

              {/* PARKING */}

              <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                <p className="text-sm text-slate-400">
                  🅿 Parking
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {listing.distanceToParking !== null
                    ? `${listing.distanceToParking} m`
                    : "Not calculated"}
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              After changing the GPS marker and
              saving, the distances are recalculated
              automatically.
            </p>
          </CardContent>
        </Card>

        {/* ================================================================ */}
        {/* SPATIAL CHARACTERISTICS                                          */}
        {/* ================================================================ */}

        <Card className="border-emerald-900/70">
          <CardHeader>
            <CardTitle>
              Spatial Characteristics
            </CardTitle>

            <CardDescription>
              These attributes are used by Smart
              Search when ranking accommodation
              according to tourist preferences.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* SPATIAL ZONE */}

            <div className="space-y-2">
              <Label htmlFor="spatialZone">
                Spatial Zone
              </Label>

              <Select
                name="spatialZone"
                defaultValue={
                  listing.spatialZone ??
                  "CENTRAL"
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select spatial zone" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="FAMILY">
                    Family Zone
                  </SelectItem>

                  <SelectItem value="QUIET">
                    Quiet Zone
                  </SelectItem>

                  <SelectItem value="ADVENTURE">
                    Adventure Zone
                  </SelectItem>

                  <SelectItem value="BEACH">
                    Beach Zone
                  </SelectItem>

                  <SelectItem value="CENTRAL">
                    Central Zone
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* SHADE / TERRAIN / NOISE */}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {/* SHADE */}

              <div className="space-y-2">
                <Label htmlFor="shadeLevel">
                  🌳 Shade Level (%)
                </Label>

                <Input
                  id="shadeLevel"
                  name="shadeLevel"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  defaultValue={
                    listing.shadeLevel ??
                    50
                  }
                  required
                />

                <p className="text-xs text-slate-400">
                  0 = no shade, 100 = full shade.
                </p>
              </div>

              {/* TERRAIN */}

              <div className="space-y-2">
                <Label htmlFor="terrainSlope">
                  ⛰ Terrain Slope (%)
                </Label>

                <Input
                  id="terrainSlope"
                  name="terrainSlope"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  defaultValue={
                    listing.terrainSlope ??
                    0
                  }
                  required
                />

                <p className="text-xs text-slate-400">
                  0 = flat terrain.
                </p>
              </div>

              {/* NOISE */}

              <div className="space-y-2">
                <Label htmlFor="noiseLevel">
                  🔊 Noise Level (1–10)
                </Label>

                <Input
                  id="noiseLevel"
                  name="noiseLevel"
                  type="number"
                  min="1"
                  max="10"
                  step="1"
                  defaultValue={
                    listing.noiseLevel ??
                    5
                  }
                  required
                />

                <p className="text-xs text-slate-400">
                  1 = very quiet, 10 = very noisy.
                </p>
              </div>
            </div>

            {/* RECOMMENDED FOR */}

            <div className="space-y-2">
              <Label htmlFor="recommendedFor">
                Recommended For
              </Label>

              <Select
                name="recommendedFor"
                defaultValue={
                  listing.recommendedFor ??
                  "FAMILY"
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select guest type" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="FAMILY">
                    👨‍👩‍👧 Family
                  </SelectItem>

                  <SelectItem value="CAMPER">
                    🚐 Camper
                  </SelectItem>

                  <SelectItem value="BACKPACKER">
                    🎒 Backpacker
                  </SelectItem>

                  <SelectItem value="DIGITAL_NOMAD">
                    💻 Digital Nomad
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* INFO */}

            <div className="rounded-xl border border-emerald-800 bg-emerald-950/20 p-4">
              <p className="font-medium text-emerald-300">
                Spatial recommendation data
              </p>

              <p className="mt-2 text-sm text-slate-300">
                Smart Search combines distances,
                shade, terrain, noise and user type
                to determine which accommodation
                best matches selected tourist
                preferences.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ================================================================ */}
        {/* INTERNAL CAMP MAP                                                */}
        {/* ================================================================ */}

        <Card>
          <CardHeader>
            <CardTitle>
              Position on Camp Layout
            </CardTitle>

            <CardDescription>
              Map X and Map Y represent the
              position of the accommodation on the
              internal camp layout. They are
              separate from GPS latitude and
              longitude.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* MAP X */}

              <div className="space-y-2">
                <Label htmlFor="mapX">
                  Map X
                </Label>

                <Input
                  id="mapX"
                  name="mapX"
                  type="number"
                  step="1"
                  min="0"
                  defaultValue={
                    listing.mapX ??
                    ""
                  }
                />

                <p className="text-xs text-slate-400">
                  Internal horizontal map position.
                </p>
              </div>

              {/* MAP Y */}

              <div className="space-y-2">
                <Label htmlFor="mapY">
                  Map Y
                </Label>

                <Input
                  id="mapY"
                  name="mapY"
                  type="number"
                  step="1"
                  min="0"
                  defaultValue={
                    listing.mapY ??
                    ""
                  }
                />

                <p className="text-xs text-slate-400">
                  Internal vertical map position.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-slate-700 bg-slate-900/50 p-3 text-xs text-slate-400">
              These values are used only for the
              internal visual camp layout. The GPS
              location above is used for real
              geographic distance calculations.
            </div>
          </CardContent>
        </Card>

        {/* ================================================================ */}
        {/* AMENITIES                                                        */}
        {/* ================================================================ */}

        <Card>
          <CardHeader>
            <CardTitle>
              Amenities
            </CardTitle>
          </CardHeader>

          <CardContent>
            {allAmenities.length === 0 ? (
              <p className="text-sm text-slate-400">
                No amenities are currently configured.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {allAmenities.map(
                  (amenity) => (
                    <div
                      key={amenity.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`amenity-${amenity.id}`}
                        name="amenities"
                        value={amenity.id}
                        defaultChecked={listingAmenityIds.has(
                          amenity.id
                        )}
                      />

                      <Label
                        htmlFor={`amenity-${amenity.id}`}
                        className="font-normal"
                      >
                        {amenity.name}
                      </Label>
                    </div>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ================================================================ */}
        {/* PHOTOS                                                           */}
        {/* ================================================================ */}

        <EditPhotosUploader
          initialPhotos={
            listing.photos
          }
        />

        {/* ================================================================ */}
        {/* SAVE                                                             */}
        {/* ================================================================ */}

        <Card className="border-slate-700">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">
                  Ready to save?
                </p>

                <p className="text-sm text-slate-400">
                  GPS distances will be recalculated
                  and the listing will be submitted
                  for approval again.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  asChild
                >
                  <Link href="/provider/dashboard">
                    Cancel
                  </Link>
                </Button>

                <Button type="submit">
                  Save Changes & Resubmit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}