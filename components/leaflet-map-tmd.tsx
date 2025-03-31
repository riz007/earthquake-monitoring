"use client";

import { useEffect, useRef, useState } from "react";
import type { TMDEarthquake } from "@/types/tmd-earthquake";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { parseISO } from "date-fns";

interface LeafletMapProps {
  earthquakes: TMDEarthquake[];
}

export default function LeafletMap({ earthquakes }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const markersRef = useRef<L.Layer[]>([]);
  const mapInitializedRef = useRef(false);

  // Fix for Leaflet icon issues in Next.js
  useEffect(() => {
    // This is needed to fix Leaflet's icon paths in Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    // Set default icon paths
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || map || mapInitializedRef.current) return;

    // Add a small delay to ensure the container is fully rendered
    const timer = setTimeout(() => {
      try {
        mapInitializedRef.current = true;

        // Center on Thailand
        const defaultCenter: [number, number] = [13.7563, 100.5018];

        // Create map instance with explicit container size check
        const mapContainer = mapRef.current;

        // Ensure the container has dimensions before initializing
        if (mapContainer.clientHeight === 0) {
          mapContainer.style.height = "400px";
        }

        // Create map with disabled animations to prevent initialization issues
        const mapInstance = L.map(mapContainer, {
          fadeAnimation: false,
          zoomAnimation: false,
          markerZoomAnimation: false,
          preferCanvas: true,
        }).setView(defaultCenter, 5);

        // Add tile layer (OpenStreetMap)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | ข้อมูลจากกรมอุตุนิยมวิทยา',
          maxZoom: 18,
        }).addTo(mapInstance);

        // Force a redraw after initialization
        setTimeout(() => {
          mapInstance.invalidateSize();
        }, 250);

        setMap(mapInstance);
      } catch (error) {
        console.error("Error initializing map:", error);
        mapInitializedRef.current = false;
      }
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      if (map) {
        map.remove();
      }
    };
  }, [mapRef.current]);

  // Add earthquake markers
  useEffect(() => {
    if (!map || earthquakes.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add markers for each earthquake
    earthquakes.forEach((quake) => {
      // Determine marker size and color based on magnitude
      const magnitude = quake.Magnitude;
      let radius = 5;
      let color = "#00FF00"; // Green for small earthquakes

      if (magnitude >= 3 && magnitude < 4) {
        radius = 7;
        color = "#0000FF"; // Blue
      } else if (magnitude >= 4 && magnitude < 5) {
        radius = 10;
        color = "#FFFF00"; // Yellow
      } else if (magnitude >= 5 && magnitude < 6) {
        radius = 14;
        color = "#FFA500"; // Orange
      } else if (magnitude >= 6) {
        radius = 18;
        color = "#FF0000"; // Red
      }

      // Create circle marker
      const marker = L.circleMarker([quake.Latitude, quake.Longitude], {
        radius,
        fillColor: color,
        color: "#FFFFFF",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7,
      }).addTo(map);

      // Parse the date with error handling
      let formattedDate;
      try {
        const dateTimeThai = parseISO(quake.DateTimeThai.replace(".000", ""));
        formattedDate = dateTimeThai.toLocaleString("th-TH", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      } catch (e) {
        formattedDate = quake.DateTimeThai; // Fallback to raw string if parsing fails
      }

      // Add popup with earthquake info
      marker.bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px; font-size: 16px;">M${magnitude.toFixed(
            1
          )} - ${quake.TitleThai}</h3>
          <p style="margin: 0; font-size: 14px;">${formattedDate}</p>
          <p style="margin: 4px 0 0; font-size: 14px;">ความลึก/Depth: ${
            quake.Depth
          } km</p>
          <p style="margin: 4px 0 0; font-size: 14px;">${quake.OriginThai}</p>
        </div>
      `);

      markersRef.current.push(marker);
    });

    // Adjust map view to fit all markers if there are any
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [map, earthquakes]);

  return (
    <div
      ref={mapRef}
      id="thailand-earthquake-map"
      className="h-full w-full min-h-[400px] z-0"
      style={{ height: "100%", width: "100%", position: "relative" }}
    />
  );
}
