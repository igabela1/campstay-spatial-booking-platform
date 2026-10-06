"use client";

import Image from "next/image";

type ListingCampMapPreviewProps = {
  imageUrl: string;
  title: string;
  mapX: number | null;
  mapY: number | null;
};

export function ListingCampMapPreview({
  imageUrl,
  title,
  mapX,
  mapY,
}: ListingCampMapPreviewProps) {
  if (mapX === null || mapY === null) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-400">
        This accommodation does not have a marked position on the camp map yet.
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-3">
      <h3 className="text-xl font-semibold text-white">
        Position on camp map
      </h3>

      <div className="relative w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
        <div className="relative aspect-[16/10] w-full">
          <Image
            src={imageUrl}
            alt="Camp layout map"
            fill
            className="object-contain"
            priority
          />

          <div
            className="absolute z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-red-600 text-xs font-bold text-white shadow-lg"
            style={{
              left: `${mapX}%`,
              top: `${mapY}%`,
            }}
            title={title}
          >
            📍
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-400">
        Marked position of this accommodation on the camp map.
      </p>
    </div>
  );
}