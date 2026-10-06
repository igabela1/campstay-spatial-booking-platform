"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ExistingPhoto = {
  id: string;
  url: string;
};

type Props = {
  initialPhotos: ExistingPhoto[];
};

export default function EditPhotosUploader({
  initialPhotos,
}: Props) {
  const [photos, setPhotos] = useState<string[]>(
    initialPhotos
      .map((photo) => photo.url)
      .filter(Boolean)
  );

  const [uploading, setUploading] =
    useState(false);

  async function handleFileUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = event.target.files
      ? Array.from(event.target.files)
      : [];

    if (files.length === 0) {
      return;
    }

    if (photos.length + files.length > 5) {
      toast.error(
        "You can upload a maximum of 5 photos."
      );

      event.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("photos", file);
      });

      const response = await fetch(
        "/api/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        toast.error(
          "Photo upload failed."
        );
        return;
      }

      const data: {
        urls?: string[];
      } = await response.json();

      const uploadedUrls =
        data.urls ?? [];

      if (
        uploadedUrls.length === 0
      ) {
        toast.error(
          "No uploaded photo URLs were returned."
        );
        return;
      }

      setPhotos((current) => [
        ...current,
        ...uploadedUrls,
      ]);

      toast.success(
        `${uploadedUrls.length} photo(s) uploaded successfully.`
      );
    } catch (error) {
      console.error(
        "Photo upload failed:",
        error
      );

      toast.error(
        "Photo upload failed."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function removePhoto(
    index: number
  ) {
    setPhotos((current) =>
      current.filter(
        (_, photoIndex) =>
          photoIndex !== index
      )
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Photos
        </CardTitle>

        <CardDescription>
          Upload up to 5 photos directly
          from your computer. The first
          photo is used as the cover
          image.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* IMPORTANT:
            updateListing() receives these
            as formData.getAll("photos")
        */}

        {photos.map(
          (url, index) => (
            <input
              key={`${url}-${index}`}
              type="hidden"
              name="photos"
              value={url}
            />
          )
        )}

        {photos.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map(
              (url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="relative overflow-hidden rounded-xl border border-slate-700 bg-slate-900"
                >
                  <img
                    src={url}
                    alt={`Accommodation photo ${
                      index + 1
                    }`}
                    className="h-44 w-full object-cover"
                  />

                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white">
                      Cover
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      removePhoto(index)
                    }
                    className="absolute right-2 top-2 rounded-md bg-black/70 px-3 py-1 text-sm text-white transition hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              )
            )}
          </div>
        )}

        {photos.length < 5 && (
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 p-8 transition hover:border-slate-500 hover:bg-slate-900/40">
            <span className="text-sm font-medium">
              {uploading
                ? "Uploading..."
                : "Click to upload photos"}
            </span>

            <span className="mt-1 text-xs text-slate-400">
              Select JPG, PNG or other
              supported images from your
              computer
            </span>

            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              onChange={
                handleFileUpload
              }
              className="hidden"
            />
          </label>
        )}

        <div className="text-sm text-slate-400">
          {photos.length}/5 photos
          selected
        </div>

        {photos.length === 0 && (
          <div className="rounded-lg border border-amber-800 bg-amber-950/20 p-3 text-sm text-amber-200">
            Add at least one photo before
            saving the accommodation.
          </div>
        )}
      </CardContent>
    </Card>
  );
}