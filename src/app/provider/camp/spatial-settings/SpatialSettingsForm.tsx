"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { PointOfInterestType } from "@prisma/client";

import { saveCampPointOfInterest } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const PoiLocationPicker = dynamic(
  () => import("./PoiLocationPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[350px] items-center justify-center rounded-xl border border-slate-700">
        Loading map...
      </div>
    ),
  }
);

type PointData = {
  id: string;
  name: string;
  type: PointOfInterestType;
  lat: number;
  lng: number;
};

type CampData = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  pointsOfInterest: PointData[];
};

type LocationValue = {
  lat: number;
  lng: number;
};

type SaveStatus =
  | "saved"
  | "unsaved"
  | "saving";

export function SpatialSettingsForm({
  camps,
}: {
  camps: CampData[];
}) {
  const [selectedCampId, setSelectedCampId] =
    useState(camps[0]?.id ?? "");

  const selectedCamp = useMemo(
    () =>
      camps.find(
        (camp) =>
          camp.id === selectedCampId
      ),
    [camps, selectedCampId]
  );

  function getInitialPoint(
    type: PointOfInterestType
  ): LocationValue {
    const existing =
      selectedCamp?.pointsOfInterest.find(
        (point) =>
          point.type === type
      );

    return {
      lat:
        existing?.lat ??
        selectedCamp?.lat ??
        43.68819,

      lng:
        existing?.lng ??
        selectedCamp?.lng ??
        17.82955,
    };
  }

  function pointAlreadyExists(
    type: PointOfInterestType
  ) {
    return Boolean(
      selectedCamp?.pointsOfInterest.find(
        (point) =>
          point.type === type
      )
    );
  }

  const [beach, setBeach] =
    useState<LocationValue>(
      getInitialPoint(
        PointOfInterestType.BEACH
      )
    );

  const [toilet, setToilet] =
    useState<LocationValue>(
      getInitialPoint(
        PointOfInterestType.TOILET
      )
    );

  const [parking, setParking] =
    useState<LocationValue>(
      getInitialPoint(
        PointOfInterestType.PARKING
      )
    );

  const [beachStatus, setBeachStatus] =
    useState<SaveStatus>(
      pointAlreadyExists(
        PointOfInterestType.BEACH
      )
        ? "saved"
        : "unsaved"
    );

  const [toiletStatus, setToiletStatus] =
    useState<SaveStatus>(
      pointAlreadyExists(
        PointOfInterestType.TOILET
      )
        ? "saved"
        : "unsaved"
    );

  const [parkingStatus, setParkingStatus] =
    useState<SaveStatus>(
      pointAlreadyExists(
        PointOfInterestType.PARKING
      )
        ? "saved"
        : "unsaved"
    );

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState<
      "success" | "error" | ""
    >("");

  function changeCamp(
    campId: string
  ) {
    setSelectedCampId(campId);

    const camp = camps.find(
      (item) =>
        item.id === campId
    );

    if (!camp) {
      return;
    }

    const getPoint = (
      type: PointOfInterestType
    ) => {
      const point =
        camp.pointsOfInterest.find(
          (item) =>
            item.type === type
        );

      return {
        lat:
          point?.lat ??
          camp.lat,

        lng:
          point?.lng ??
          camp.lng,
      };
    };

    setBeach(
      getPoint(
        PointOfInterestType.BEACH
      )
    );

    setToilet(
      getPoint(
        PointOfInterestType.TOILET
      )
    );

    setParking(
      getPoint(
        PointOfInterestType.PARKING
      )
    );

    setBeachStatus(
      camp.pointsOfInterest.some(
        (point) =>
          point.type ===
          PointOfInterestType.BEACH
      )
        ? "saved"
        : "unsaved"
    );

    setToiletStatus(
      camp.pointsOfInterest.some(
        (point) =>
          point.type ===
          PointOfInterestType.TOILET
      )
        ? "saved"
        : "unsaved"
    );

    setParkingStatus(
      camp.pointsOfInterest.some(
        (point) =>
          point.type ===
          PointOfInterestType.PARKING
      )
        ? "saved"
        : "unsaved"
    );

    setMessage("");
    setMessageType("");
  }

  async function savePoint(
    type: PointOfInterestType,
    name: string,
    location: LocationValue,
    setStatus: (
      status: SaveStatus
    ) => void
  ) {
    if (!selectedCampId) {
      setMessage(
        "No camp selected."
      );

      setMessageType("error");

      return;
    }

    try {
      setStatus("saving");

      setMessage(
        `Saving ${name} location...`
      );

      setMessageType("");

      const result =
        await saveCampPointOfInterest({
          campId:
            selectedCampId,

          type,

          name,

          lat: location.lat,

          lng: location.lng,
        });

      if (result.success) {
        setStatus("saved");

        setMessage(
          `${name} location saved successfully. Distances to existing accommodations were recalculated automatically.`
        );

        setMessageType(
          "success"
        );
      } else {
        setStatus("unsaved");

        setMessage(
          result.message
        );

        setMessageType("error");
      }
    } catch (error) {
      console.error(
        "Error while saving spatial point:",
        error
      );

      setStatus("unsaved");

      setMessage(
        "Unexpected error while saving location."
      );

      setMessageType("error");
    }
  }

  function renderStatus(
    status: SaveStatus
  ) {
    if (
      status === "saving"
    ) {
      return (
        <span className="text-sm text-amber-400">
          Saving...
        </span>
      );
    }

    if (
      status === "saved"
    ) {
      return (
        <span className="text-sm font-medium text-emerald-400">
          ✓ Saved
        </span>
      );
    }

    return (
      <span className="text-sm text-slate-400">
        Unsaved changes
      </span>
    );
  }

  if (camps.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          No camps were found for
          this provider.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">

      {/* ------------------------------------------------ */}
      {/* CAMP SELECTION                                   */}
      {/* ------------------------------------------------ */}

      <Card>
        <CardHeader>
          <CardTitle>
            Spatial Settings
          </CardTitle>

          <CardDescription>
            Define important geographic
            reference points for the
            selected camp. These locations
            are used to automatically
            calculate distances and improve
            spatial search and
            recommendations.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <label className="mb-2 block text-sm font-medium">
            Camp
          </label>

          <select
            value={selectedCampId}
            onChange={(event) =>
              changeCamp(
                event.target.value
              )
            }
            className="w-full rounded-md border border-slate-700 bg-slate-900 p-3 text-white"
          >
            {camps.map(
              (camp) => (
                <option
                  key={camp.id}
                  value={camp.id}
                >
                  {camp.name}
                </option>
              )
            )}
          </select>
        </CardContent>
      </Card>

      {/* ------------------------------------------------ */}
      {/* MESSAGE                                          */}
      {/* ------------------------------------------------ */}

      {message && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            messageType ===
            "success"
              ? "border-emerald-700 bg-emerald-950/40 text-emerald-300"
              : messageType ===
                "error"
              ? "border-red-700 bg-red-950/40 text-red-300"
              : "border-slate-700 bg-slate-900 text-slate-300"
          }`}
        >
          {message}
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* BEACH                                            */}
      {/* ------------------------------------------------ */}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>
                🏖 Beach Location
              </CardTitle>

              <CardDescription className="mt-2">
                Click the exact beach
                access point on the
                geographic map.
              </CardDescription>
            </div>

            {renderStatus(
              beachStatus
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <PoiLocationPicker
            key={`${selectedCampId}-beach`}
            latitude={beach.lat}
            longitude={beach.lng}
            onChange={(
              lat,
              lng
            ) => {
              setBeach({
                lat,
                lng,
              });

              setBeachStatus(
                "unsaved"
              );

              setMessage("");
              setMessageType("");
            }}
          />

          <div className="rounded-lg bg-slate-900 p-3 text-sm text-muted-foreground">
            <div>
              Latitude:{" "}
              {beach.lat.toFixed(
                6
              )}
            </div>

            <div>
              Longitude:{" "}
              {beach.lng.toFixed(
                6
              )}
            </div>
          </div>

          <Button
            disabled={
              beachStatus ===
              "saving"
            }
            onClick={() =>
              savePoint(
                PointOfInterestType.BEACH,
                "Beach",
                beach,
                setBeachStatus
              )
            }
          >
            {beachStatus ===
            "saving"
              ? "Saving..."
              : beachStatus ===
                "saved"
              ? "Saved ✓"
              : "Save Beach Location"}
          </Button>
        </CardContent>
      </Card>

      {/* ------------------------------------------------ */}
      {/* TOILET                                           */}
      {/* ------------------------------------------------ */}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>
                🚻 Toilet Location
              </CardTitle>

              <CardDescription className="mt-2">
                Click the geographic
                location of the main
                toilet facilities.
              </CardDescription>
            </div>

            {renderStatus(
              toiletStatus
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <PoiLocationPicker
            key={`${selectedCampId}-toilet`}
            latitude={toilet.lat}
            longitude={toilet.lng}
            onChange={(
              lat,
              lng
            ) => {
              setToilet({
                lat,
                lng,
              });

              setToiletStatus(
                "unsaved"
              );

              setMessage("");
              setMessageType("");
            }}
          />

          <div className="rounded-lg bg-slate-900 p-3 text-sm text-muted-foreground">
            <div>
              Latitude:{" "}
              {toilet.lat.toFixed(
                6
              )}
            </div>

            <div>
              Longitude:{" "}
              {toilet.lng.toFixed(
                6
              )}
            </div>
          </div>

          <Button
            disabled={
              toiletStatus ===
              "saving"
            }
            onClick={() =>
              savePoint(
                PointOfInterestType.TOILET,
                "Toilet",
                toilet,
                setToiletStatus
              )
            }
          >
            {toiletStatus ===
            "saving"
              ? "Saving..."
              : toiletStatus ===
                "saved"
              ? "Saved ✓"
              : "Save Toilet Location"}
          </Button>
        </CardContent>
      </Card>

      {/* ------------------------------------------------ */}
      {/* PARKING                                          */}
      {/* ------------------------------------------------ */}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>
                🅿️ Parking Location
              </CardTitle>

              <CardDescription className="mt-2">
                Click the geographic
                location of the main
                camp parking area.
              </CardDescription>
            </div>

            {renderStatus(
              parkingStatus
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <PoiLocationPicker
            key={`${selectedCampId}-parking`}
            latitude={parking.lat}
            longitude={parking.lng}
            onChange={(
              lat,
              lng
            ) => {
              setParking({
                lat,
                lng,
              });

              setParkingStatus(
                "unsaved"
              );

              setMessage("");
              setMessageType("");
            }}
          />

          <div className="rounded-lg bg-slate-900 p-3 text-sm text-muted-foreground">
            <div>
              Latitude:{" "}
              {parking.lat.toFixed(
                6
              )}
            </div>

            <div>
              Longitude:{" "}
              {parking.lng.toFixed(
                6
              )}
            </div>
          </div>

          <Button
            disabled={
              parkingStatus ===
              "saving"
            }
            onClick={() =>
              savePoint(
                PointOfInterestType.PARKING,
                "Parking",
                parking,
                setParkingStatus
              )
            }
          >
            {parkingStatus ===
            "saving"
              ? "Saving..."
              : parkingStatus ===
                "saved"
              ? "Saved ✓"
              : "Save Parking Location"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}