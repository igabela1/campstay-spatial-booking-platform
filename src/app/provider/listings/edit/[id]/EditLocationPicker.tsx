"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const LocationPicker = dynamic(
  () => import("@/components/ui/LocationPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] items-center justify-center rounded-xl border border-slate-700 bg-slate-900">
        <p className="text-sm text-slate-400">
          Loading map...
        </p>
      </div>
    ),
  }
);

type Props = {
  initialLat: number;
  initialLng: number;
};

export default function EditLocationPicker({
  initialLat,
  initialLng,
}: Props) {
  const [lat, setLat] =
    useState(initialLat);

  const [lng, setLng] =
    useState(initialLng);

  const [changed, setChanged] =
    useState(false);

  return (
    <Card className="border-slate-800">
      <CardHeader>
        <CardTitle>
          📍 Exact Accommodation Location
        </CardTitle>

        <CardDescription>
          Click directly on the map to
          place this accommodation at its
          exact position inside the camp.
          Distances to the beach, toilet
          and parking are calculated
          automatically after saving.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <LocationPicker
          latitude={lat}
          longitude={lng}
          onChange={(
            newLat,
            newLng
          ) => {
            setLat(newLat);
            setLng(newLng);
            setChanged(true);
          }}
        />

        {/* These values are sent with the form */}
        <input
          type="hidden"
          name="lat"
          value={lat}
        />

        <input
          type="hidden"
          name="lng"
          value={lng}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-3">
            <p className="text-xs text-slate-400">
              Latitude
            </p>

            <p className="font-mono text-sm">
              {lat.toFixed(8)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-700 bg-slate-900 p-3">
            <p className="text-xs text-slate-400">
              Longitude
            </p>

            <p className="font-mono text-sm">
              {lng.toFixed(8)}
            </p>
          </div>
        </div>

        <div
          className={`rounded-lg border p-4 text-sm ${
            changed
              ? "border-amber-700 bg-amber-950/30 text-amber-300"
              : "border-emerald-700 bg-emerald-950/30 text-emerald-300"
          }`}
        >
          {changed
            ? "● New location selected. Click Save Changes & Resubmit to save it and recalculate spatial distances."
            : "✓ Current geographic location loaded from the database."}
        </div>
      </CardContent>
    </Card>
  );
}