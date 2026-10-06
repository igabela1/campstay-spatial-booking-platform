'use client';

import { useRef } from 'react';

type MapPositionPickerProps = {
  imageUrl: string;
  mapX: number | null;
  mapY: number | null;
  onChange: (x: number, y: number) => void;
};

export function MapPositionPicker({
  imageUrl,
  mapX,
  mapY,
  onChange,
}: MapPositionPickerProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const xPercent = Number(((clickX / rect.width) * 100).toFixed(2));
    const yPercent = Number(((clickY / rect.height) * 100).toFixed(2));

    onChange(xPercent, yPercent);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Klikni na sliku da označiš gdje se nalazi smještaj.
      </p>

      <div
        className="relative inline-block cursor-crosshair overflow-hidden rounded-xl border"
        onClick={handleClick}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Camp map"
          className="block max-w-full rounded-xl"
        />

        {mapX !== null && mapY !== null && (
          <div
            className="absolute flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg"
            style={{
              left: `${mapX}%`,
              top: `${mapY}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            📍
          </div>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        <p>mapX: {mapX ?? '-'}</p>
        <p>mapY: {mapY ?? '-'}</p>
      </div>
    </div>
  );
}