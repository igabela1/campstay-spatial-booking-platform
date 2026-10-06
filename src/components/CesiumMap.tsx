"use client";

import { useEffect, useRef } from "react";

import {
  Cartesian2,
  Cartesian3,
  Color,
  Ion,
  LabelStyle,
  VerticalOrigin,
  Viewer,
} from "cesium";

import "cesium/Build/Cesium/Widgets/widgets.css";

type CesiumWindow = Window &
  typeof globalThis & {
    CESIUM_BASE_URL?: string;
  };

export default function CesiumMap() {
  const cesiumContainer =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!cesiumContainer.current) {
      return;
    }

    /*
     * Cesium učitava Workers, Assets, Widgets
     * i ThirdParty resurse sa ove lokacije.
     */
    const cesiumWindow =
      window as CesiumWindow;

    cesiumWindow.CESIUM_BASE_URL =
      "/cesium/";

    /*
     * Cesium Ion token iz .env fajla.
     */
    Ion.defaultAccessToken =
      process.env.NEXT_PUBLIC_CESIUM_TOKEN ??
      "";

    /*
     * Kreiranje Cesium Viewer-a.
     */
    const viewer = new Viewer(
      cesiumContainer.current,
      {
        animation: false,
        timeline: false,
        baseLayerPicker: false,
        geocoder: false,
        homeButton: true,
        sceneModePicker: true,
        navigationHelpButton: false,
        fullscreenButton: false,
      }
    );

    /*
     * Lokacija Auto Kampa Miris Ljeta.
     */
    const campLatitude =
      43.688190063997105;

    const campLongitude =
      17.82955111207453;

    /*
     * Kamera leti prema kampu nakon
     * učitavanja 3D prikaza.
     */
    viewer.camera.flyTo({
      destination:
        Cartesian3.fromDegrees(
          campLongitude,
          campLatitude,
          1500
        ),

      orientation: {
        heading: 0,
        pitch: -0.8,
        roll: 0,
      },

      duration: 2,
    });

    /*
     * Marker kampa.
     */
    viewer.entities.add({
      name: "Auto Kamp Miris Ljeta",

      position:
        Cartesian3.fromDegrees(
          campLongitude,
          campLatitude,
          100
        ),

      point: {
        pixelSize: 14,
        color: Color.RED,
        outlineColor: Color.WHITE,
        outlineWidth: 3,
      },

      label: {
        text: "Auto Kamp Miris Ljeta",

        font: "16px sans-serif",

        fillColor: Color.WHITE,

        outlineColor: Color.BLACK,

        outlineWidth: 3,

        style:
          LabelStyle.FILL_AND_OUTLINE,

        verticalOrigin:
          VerticalOrigin.BOTTOM,

        pixelOffset:
          new Cartesian2(0, -20),
      },
    });

    /*
     * Cleanup kada korisnik napusti
     * 3D map stranicu.
     */
    return () => {
      if (!viewer.isDestroyed()) {
        viewer.destroy();
      }
    };
  }, []);

  return (
    <div className="h-[calc(100vh-4rem)] w-full bg-slate-950">
      <div
        ref={cesiumContainer}
        className="h-full w-full"
      />
    </div>
  );
}