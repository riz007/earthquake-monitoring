"use client"

import { useState, useEffect } from "react"
import type { UserLocation } from "@/types/location"

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [permissionState, setPermissionState] = useState<PermissionState | null>(null)

  const fetchBrowserLocation = async (): Promise<UserLocation> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"))
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Get coordinates
            const { latitude, longitude } = position.coords

            // Try to get location details using reverse geocoding
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
                { headers: { "User-Agent": "EarthquakeMonitor/1.0" } },
              )

              if (response.ok) {
                const data = await response.json()
                resolve({
                  latitude,
                  longitude,
                  city: data.address?.city || data.address?.town || data.address?.village || "Unknown",
                  region: data.address?.state || data.address?.county || "Unknown",
                  country: data.address?.country || "Unknown",
                  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                })
              } else {
                // If reverse geocoding fails, return coordinates only
                resolve({
                  latitude,
                  longitude,
                  city: "Unknown",
                  region: "Unknown",
                  country: "Unknown",
                  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                })
              }
            } catch (geocodeError) {
              console.error("Reverse geocoding failed:", geocodeError)
              // If reverse geocoding fails, return coordinates only
              resolve({
                latitude,
                longitude,
                city: "Unknown",
                region: "Unknown",
                country: "Unknown",
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              })
            }
          } catch (err) {
            reject(err)
          }
        },
        (err) => {
          reject(err)
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000,
        },
      )
    })
  }

  const checkPermission = async () => {
    if (!navigator.permissions || !navigator.permissions.query) {
      // Browser doesn't support permissions API
      return null
    }

    try {
      const result = await navigator.permissions.query({ name: "geolocation" as PermissionName })
      return result.state
    } catch (err) {
      console.error("Error checking geolocation permission:", err)
      return null
    }
  }

  const fetchLocation = async () => {
    setLoading(true)
    setError(null)

    try {
      // Check permission first
      const permission = await checkPermission()
      setPermissionState(permission)

      if (permission === "denied") {
        setError("Location permission denied. Please enable location services in your browser.")
        setLocation(null)
        setLoading(false)
        return
      }

      // Try browser geolocation
      const userLocation = await fetchBrowserLocation()
      setLocation(userLocation)
      setError(null)
    } catch (err) {
      console.error("Error fetching user location:", err)
      setError(err instanceof Error ? err.message : "Failed to detect location")
      setLocation(null)
    } finally {
      setLoading(false)
    }
  }

  // Function to retry location detection
  const retryLocation = () => {
    fetchLocation()
  }

  useEffect(() => {
    fetchLocation()
  }, [])

  return {
    location,
    loading,
    error,
    retryLocation,
    permissionState,
  }
}

