import type { ReactNode } from "react";
import type {
  AccommodationType,
  ListingStatus,
  Provider as ProviderModel,
  User,
} from "@prisma/client";

export type Listing = {
  id: string;
  title: string;
  description?: string;

  address?: string;
  city?: string;
  location?: string;

  price: number;
  type: AccommodationType;
  capacity: number;

  amenities?: string[];

  status?:
    | ListingStatus
    | "pending"
    | "approved"
    | "rejected";

  providerId?: string;
  campId?: string | null;

  image?: string | null;
  imageUrl?: string;
  imageHint?: string;

  lat: number;
  lng: number;

  mapX?: number | null;
  mapY?: number | null;

  isAvailable?: boolean;

  spatialZone?:
    | "FAMILY"
    | "QUIET"
    | "ADVENTURE"
    | "BEACH"
    | "CENTRAL"
    | null;

  distanceToToilet?: number | null;
  distanceToBeach?: number | null;
  distanceToParking?: number | null;
  shadeLevel?: number | null;
  terrainSlope?: number | null;
  noiseLevel?: number | null;

  recommendedFor?:
    | "FAMILY"
    | "CAMPER"
    | "BACKPACKER"
    | "DIGITAL_NOMAD"
    | null;
};

export type Provider = {
  id: string;
  providerName: string;
  contactName: string;
  phone: string;
  address: string;

  businessIdentifier?: string | null;

  /*
   * Ostavljeno radi kompatibilnosti sa starijim komponentama.
   * U bazi se vrijednost čuva kao businessIdentifier.
   */
  nic?: string | null;

  status:
    | "pending"
    | "approved"
    | "rejected"
    | "PENDING"
    | "APPROVED"
    | "REJECTED";

  isVerified?: boolean;
};

export type MarkerData = {
  position: [number, number];
  popupContent: ReactNode;
  item: Listing;
  type: "listing";
};

export type ProviderWithProfile = User & {
  providerProfile: ProviderModel | null;
};