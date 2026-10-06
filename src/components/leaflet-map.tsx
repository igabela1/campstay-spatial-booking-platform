"use client";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { memo, useEffect } from "react";

import type {
  Listing,
  MarkerData,
} from "@/lib/types";

/*
 * Leaflet u Next.js aplikaciji često ne pronađe standardne
 * marker ikonice, pa ručno postavljamo njihove URL adrese.
 */
delete (
  L.Icon.Default.prototype as unknown as {
    _getIconUrl?: unknown;
  }
)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const listingIcon = new L.Icon({
  iconUrl:
    "https://img.icons8.com/office/80/marker.png",

  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

type LeafletMapProps = {
  center: [number, number];
  zoom: number;
  markers: MarkerData[];
  selectedListing: Listing | null;
  onMarkerClick: (item: Listing) => void;
  onPopupClose: () => void;
};

type MapControllerProps = {
  center: [number, number];
  zoom: number;
  selectedListing: Listing | null;
};

/*
 * Ova komponenta se renderuje unutar MapContainer,
 * zato ovdje smijemo koristiti useMap().
 */
function MapController({
  center,
  zoom,
  selectedListing,
}: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (
      selectedListing &&
      Number.isFinite(selectedListing.lat) &&
      Number.isFinite(selectedListing.lng)
    ) {
      map.setView(
        [
          selectedListing.lat,
          selectedListing.lng,
        ],
        Math.max(zoom, 15),
        {
          animate: true,
        }
      );

      return;
    }

    map.setView(center, zoom, {
      animate: true,
    });
  }, [
    center,
    zoom,
    selectedListing,
    map,
  ]);

  return null;
}

function MapEvents({
  onPopupClose,
}: {
  onPopupClose: () => void;
}) {
  useMapEvents({
    popupclose: () => {
      onPopupClose();
    },
  });

  return null;
}

const LeafletMap = memo(function LeafletMap({
  center,
  zoom,
  markers,
  selectedListing,
  onMarkerClick,
  onPopupClose,
}: LeafletMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      style={{
        height: "100%",
        minHeight: "500px",
        width: "100%",
        zIndex: 1,
      }}
    >
      <MapController
        center={center}
        zoom={zoom}
        selectedListing={selectedListing}
      />

      <TileLayer
        attribution={
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapEvents
        onPopupClose={onPopupClose}
      />

      {markers.map((marker) => (
        <Marker
          key={marker.item.id}
          position={marker.position}
          icon={listingIcon}
          opacity={0.9}
          eventHandlers={{
            click: () => {
              onMarkerClick(marker.item);
            },
          }}
        >
          <Popup>
            {marker.popupContent}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
});

export default LeafletMap;