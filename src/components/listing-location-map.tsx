"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

type Props = {
  latitude: number;
  longitude: number;
  title: string;
};

const defaultIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapUpdater({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(
      [latitude, longitude],
      18
    );
  }, [latitude, longitude, map]);

  return null;
}

export default function ListingLocationMap({
  latitude,
  longitude,
  title,
}: Props) {
  return (
    <div className="h-[380px] w-full overflow-hidden rounded-xl border border-slate-700">
      <MapContainer
        center={[
          latitude,
          longitude,
        ]}
        zoom={18}
        scrollWheelZoom
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater
          latitude={latitude}
          longitude={longitude}
        />

        <Marker
          position={[
            latitude,
            longitude,
          ]}
          icon={defaultIcon}
        >
          <Popup>
            <strong>{title}</strong>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}