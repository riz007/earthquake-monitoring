"use client"

import { useEffect, useRef, useState } from "react"
import type { Earthquake } from "@/types/earthquake"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface LeafletDetailMapProps {
  earthquake: Earthquake
}

export default function LeafletDetailMap({ earthquake }: LeafletDetailMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<L.Map | null>(null)
  const mapInitializedRef = useRef(false)

  // Fix for Leaflet icon issues in Next.js
  useEffect(() => {
    // This is needed to fix Leaflet's icon paths in Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl

    // Set default icon paths
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    })
  }, [])

  // Fix the map initialization and positioning issues
  // Ensure the map container has proper dimensions and the map is initialized correctly

  // Replace the useEffect for map initialization with this improved version:
  useEffect(() => {
    if (!mapRef.current || map || mapInitializedRef.current) return

    // Add a small delay to ensure the container is fully rendered
    const timer = setTimeout(() => {
      try {
        mapInitializedRef.current = true

        // Check if we have valid coordinates
        const [lng, lat] = earthquake.coordinates
        const hasValidCoordinates = lng !== 0 || lat !== 0

        // Default center if no valid coordinates
        const center: [number, number] = hasValidCoordinates ? [lat, lng] : [20, 0]
        const zoom = hasValidCoordinates ? 8 : 2

        // Ensure the container has dimensions before initializing
        const mapContainer = mapRef.current
        if (mapContainer.clientHeight === 0) {
          mapContainer.style.height = "400px"
        }

        // Create map instance with options to prevent animation issues
        const mapInstance = L.map(mapContainer, {
          fadeAnimation: false,
          zoomAnimation: false,
          markerZoomAnimation: false,
          preferCanvas: true,
        }).setView(center, zoom)

        // Add tile layer (OpenStreetMap)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(mapInstance)

        // Only add marker and circle if we have valid coordinates
        if (hasValidCoordinates) {
          // Determine marker size and color based on magnitude
          const magnitude = earthquake.magnitude
          let radius = 8
          let color = "#00FF00" // Green for small earthquakes
          let circleRadius = 10000 // 10km radius

          if (magnitude >= 4 && magnitude < 5) {
            radius = 12
            color = "#FFFF00" // Yellow
            circleRadius = 30000 // 30km
          } else if (magnitude >= 5 && magnitude < 6) {
            radius = 16
            color = "#FFA500" // Orange
            circleRadius = 50000 // 50km
          } else if (magnitude >= 6) {
            radius = 20
            color = "#FF0000" // Red
            circleRadius = 100000 // 100km
          }

          // Add special color for earthquakes with alerts
          if (earthquake.alert === "yellow") color = "#FFFF00"
          if (earthquake.alert === "orange") color = "#FFA500"
          if (earthquake.alert === "red") color = "#FF0000"

          // Add earthquake marker
          const marker = L.circleMarker([lat, lng], {
            radius,
            fillColor: color,
            color: "#FFFFFF",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.7,
          }).addTo(mapInstance)

          // Add popup with earthquake info
          marker
            .bindPopup(`
              <div>
                <h3 style="margin: 0 0 8px; font-size: 16px;">M${magnitude.toFixed(1)} - ${earthquake.place}</h3>
                <p style="margin: 0; font-size: 14px;">${new Date(earthquake.time).toLocaleString()}</p>
                <p style="margin: 4px 0 0; font-size: 14px;">Depth: ${earthquake.depth.toFixed(1)} km</p>
                ${earthquake.tsunami ? '<p style="margin: 4px 0 0; color: red; font-weight: bold; font-size: 14px;">Tsunami Risk</p>' : ""}
              </div>
            `)
            .openPopup()

          // Add impact radius circle
          L.circle([lat, lng], {
            color: color,
            fillColor: color,
            fillOpacity: 0.1,
            radius: circleRadius,
          }).addTo(mapInstance)
        } else {
          // Add a message for unavailable location
          const worldCenter = [20, 0]
          L.marker(worldCenter as L.LatLngExpression)
            .addTo(mapInstance)
            .bindPopup(`
              <div>
                <h3 style="margin: 0 0 8px; font-size: 16px;">Location Unavailable</h3>
                <p style="margin: 0; font-size: 14px;">Earthquake ID: ${earthquake.id}</p>
                <p style="margin: 4px 0 0; font-size: 14px;">Coordinates not available for this earthquake.</p>
              </div>
            `)
            .openPopup()
        }

        // Force a redraw after initialization
        setTimeout(() => {
          mapInstance.invalidateSize()
        }, 250)

        setMap(mapInstance)
      } catch (error) {
        console.error("Error initializing detail map:", error)
        mapInitializedRef.current = false
      }
    }, 100)

    // Cleanup function
    return () => {
      clearTimeout(timer)
      if (map) {
        map.remove()
      }
    }
  }, [earthquake])

  // Replace the return statement with this:
  return (
    <div
      ref={mapRef}
      id="earthquake-detail-map"
      className="h-full w-full min-h-[400px] z-0"
      style={{ height: "100%", width: "100%", position: "relative" }}
    />
  )
}

