"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

type LocationPickerProps = {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
};

export default function LocationPicker({
  latitude,
  longitude,
  onChange,
}: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);

  const validLatitude = Number.isFinite(latitude)
    ? latitude
    : 43.68819;

  const validLongitude = Number.isFinite(longitude)
    ? longitude
    : 17.82955;

  /* ------------------------------------------------------- */
  /* Keep latest callback                                    */
  /* ------------------------------------------------------- */

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  /* ------------------------------------------------------- */
  /* CREATE MAP ONLY ONCE                                    */
  /* ------------------------------------------------------- */

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    /*
      Extra protection against Leaflet trying to reuse
      an already initialized container during Next.js HMR.
    */
    const leafletContainer = container as HTMLDivElement & {
      _leaflet_id?: number;
    };

    if (leafletContainer._leaflet_id) {
      leafletContainer._leaflet_id = undefined;
    }

    const map = L.map(container, {
      center: [validLatitude, validLongitude],
      zoom: 19,
      scrollWheelZoom: true,
    });

    mapRef.current = map;

    /* ----------------------------------------------------- */
    /* TILE LAYER                                            */
    /* ----------------------------------------------------- */

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 20,
      }
    ).addTo(map);

    /* ----------------------------------------------------- */
    /* ICON                                                  */
    /* ----------------------------------------------------- */

    const markerIcon = L.icon({
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

    /* ----------------------------------------------------- */
    /* INITIAL MARKER                                        */
    /* ----------------------------------------------------- */

    const marker = L.marker(
      [validLatitude, validLongitude],
      {
        icon: markerIcon,
      }
    ).addTo(map);

    markerRef.current = marker;

    /* ----------------------------------------------------- */
    /* CLICK HANDLER                                         */
    /* ----------------------------------------------------- */

    const handleMapClick = (event: L.LeafletMouseEvent) => {
      const { lat, lng } = event.latlng;

      marker.setLatLng([lat, lng]);

      onChangeRef.current(lat, lng);
    };

    map.on("click", handleMapClick);

    /*
      Leaflet occasionally calculates its size before the
      container has finished rendering.
    */
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    /* ----------------------------------------------------- */
    /* CLEANUP                                               */
    /* ----------------------------------------------------- */

    return () => {
      map.off("click", handleMapClick);

      markerRef.current = null;

      map.remove();

      mapRef.current = null;

      /*
        Important for Next.js development mode / HMR.
      */
      if (leafletContainer._leaflet_id) {
        leafletContainer._leaflet_id = undefined;
      }
    };

    /*
      Intentionally create the map only once.
      latitude / longitude updates are handled below.
    */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------------------------------- */
  /* UPDATE MARKER WHEN FORM COORDINATES CHANGE              */
  /* ------------------------------------------------------- */

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;

    if (!map || !marker) {
      return;
    }

    marker.setLatLng([
      validLatitude,
      validLongitude,
    ]);

    map.setView(
      [validLatitude, validLongitude],
      19,
      {
        animate: false,
      }
    );
  }, [validLatitude, validLongitude]);

  /* ------------------------------------------------------- */
  /* UI                                                      */
  /* ------------------------------------------------------- */

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="h-[420px] w-full overflow-hidden rounded-xl border border-slate-700"
      />

      <p className="text-xs text-muted-foreground">
        Click on the map to select the exact accommodation location.
      </p>
    </div>
  );
}