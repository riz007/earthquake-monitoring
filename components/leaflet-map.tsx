"use client"

import { useEffect, useRef, useState } from "react"
import type { Earthquake } from "@/types/earthquake"
import type { UserLocation } from "@/types/location"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface LeafletMapProps {
  earthquakes: Earthquake[]
  userLocation?: UserLocation | null
  onEarthquakeClick?: (id: string) => void
}

export default function LeafletMap({ earthquakes, userLocation, onEarthquakeClick }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<L.Map | null>(null)
  const markersRef = useRef<L.Layer[]>([])
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

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || map || mapInitializedRef.current) return

    // Add a small delay to ensure the container is fully rendered
    const timer = setTimeout(() => {
      try {
        mapInitializedRef.current = true

        // Default center on Thailand
        const defaultCenter: [number, number] = [13.7563, 100.5018]

        // Create map instance with explicit container size check
        const mapContainer = mapRef.current

        // Ensure the container has dimensions before initializing
        if (mapContainer.clientHeight === 0) {
          mapContainer.style.height = "400px"
        }

        // Create map with disabled animations to prevent initialization issues
        const mapInstance = L.map(mapContainer, {
          fadeAnimation: false,
          zoomAnimation: false,
          markerZoomAnimation: false,
          preferCanvas: true,
        }).setView(defaultCenter, 5)

        // Add tile layer (OpenStreetMap)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(mapInstance)

        // Force a redraw after initialization
        setTimeout(() => {
          mapInstance.invalidateSize()
        }, 250)

        setMap(mapInstance)
      } catch (error) {
        console.error("Error initializing map:", error)
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
  }, [mapRef.current])

  // Add user location marker
  useEffect(() => {
    if (!map || !userLocation) return

    map.setView([userLocation.latitude, userLocation.longitude], 7)

    // Add user location marker
    const userLocationMarker = L.circleMarker([userLocation.latitude, userLocation.longitude], {
      radius: 8,
      fillColor: "#4285F4",
      color: "#ffffff",
      weight: 2,
      opacity: 1,
      fillOpacity: 1,
    })
      .addTo(map)
      .bindTooltip("Your Location", { permanent: false, direction: "top" })

    markersRef.current.push(userLocationMarker)

    return () => {
      userLocationMarker.remove()
    }
  }, [map, userLocation])

  // Add earthquake markers
  useEffect(() => {
    if (!map || earthquakes.length === 0) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    earthquakes.forEach((quake) => {
      const [lng, lat] = quake.coordinates

      // Determine marker size and color based on magnitude
      const magnitude = quake.magnitude
      let radius = 5
      let color = "#00FF00" // Green for small earthquakes

      if (magnitude >= 4 && magnitude < 5) {
        radius = 8
        color = "#FFFF00" // Yellow
      } else if (magnitude >= 5 && magnitude < 6) {
        radius = 12
        color = "#FFA500" // Orange
      } else if (magnitude >= 6) {
        radius = 16
        color = "#FF0000" // Red
      }

      // Add special color for earthquakes with alerts
      if (quake.alert === "yellow") color = "#FFFF00"
      if (quake.alert === "orange") color = "#FFA500"
      if (quake.alert === "red") color = "#FF0000"

      // Create circle marker
      const marker = L.circleMarker([lat, lng], {
        radius,
        fillColor: color,
        color: "#FFFFFF",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7,
      }).addTo(map)

      // Add popup with earthquake info
      marker.bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px; font-size: 16px;">M${magnitude.toFixed(1)} - ${quake.place}</h3>
          <p style="margin: 0; font-size: 14px;">${new Date(quake.time).toLocaleString()}</p>
          <p style="margin: 4px 0 0; font-size: 14px;">Depth: ${quake.depth.toFixed(1)} km</p>
          ${quake.tsunami ? `<p style="margin: 4px 0 0; color: red; font-weight: bold; font-size: 14px;">Tsunami Risk</p>` : ""}
          <button style="margin-top: 8px; padding: 4px 8px; cursor: pointer;">View Details</button>
        </div>
      `)

      // Add click event to navigate to earthquake detail page
      marker.on("popupopen", (e) => {
        const popup = e.popup
        const container = popup.getElement()

        if (container) {
          const button = container.querySelector("button")
          if (button) {
            button.addEventListener("click", () => {
              if (onEarthquakeClick) {
                onEarthquakeClick(quake.id)
              }
            })
          }
        }
      })

      markersRef.current.push(marker)
    })

    return () => {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
    }
  }, [map, earthquakes, onEarthquakeClick])

  // Update the return statement to include explicit dimensions
  return (
    <div
      ref={mapRef}
      id="earthquake-map"
      className="h-full w-full min-h-[400px] z-0"
      style={{ height: "100%", width: "100%", position: "relative" }}
    />
  )
}

