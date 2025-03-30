"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { MapPin, Loader } from "lucide-react"
import { useUserLocation } from "@/hooks/use-user-location"
import { getNearbyEarthquakes } from "@/lib/earthquake-service"
import type { Earthquake } from "@/types/earthquake"

export default function UserLocationBanner() {
  const { location, loading, error } = useUserLocation()
  const [nearbyEarthquakes, setNearbyEarthquakes] = useState<Earthquake[]>([])
  const [fetchingEarthquakes, setFetchingEarthquakes] = useState(false)

  useEffect(() => {
    const fetchNearbyEarthquakes = async () => {
      if (location) {
        try {
          setFetchingEarthquakes(true)
          // Get earthquakes within 300km in the last 7 days with magnitude >= 2.5
          const data = await getNearbyEarthquakes(
            location.latitude,
            location.longitude,
            300, // 300km radius
            7, // Last 7 days
            2.5, // Min magnitude 2.5
          )
          setNearbyEarthquakes(data)
        } catch (err) {
          console.error("Failed to fetch nearby earthquakes:", err)
        } finally {
          setFetchingEarthquakes(false)
        }
      }
    }

    fetchNearbyEarthquakes()
  }, [location])

  if (loading || fetchingEarthquakes) {
    return (
      <Alert className="bg-muted">
        <Loader className="h-4 w-4 animate-spin" />
        <AlertTitle>{loading ? "Detecting your location..." : "Checking for nearby seismic activity..."}</AlertTitle>
        <AlertDescription>
          {loading
            ? "This may take a moment. We're determining your location to provide relevant earthquake data."
            : "Analyzing recent earthquake data in your region..."}
        </AlertDescription>
      </Alert>
    )
  }

  // Even if there was an error, we should still have a default location
  // So we don't need to show an error message unless location is null
  if (!location) {
    return (
      <Alert variant="destructive">
        <MapPin className="h-4 w-4" />
        <AlertTitle>Location unavailable</AlertTitle>
        <AlertDescription>We couldn't detect your location. Using default region data instead.</AlertDescription>
      </Alert>
    )
  }

  const hasNearbyEarthquakes = nearbyEarthquakes.length > 0
  const significantEarthquakes = nearbyEarthquakes.filter((eq) => eq.magnitude >= 4.0)
  const hasSignificantEarthquakes = significantEarthquakes.length > 0

  return (
    <Alert
      className={
        hasSignificantEarthquakes
          ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900"
          : hasNearbyEarthquakes
            ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900"
            : "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900"
      }
    >
      <MapPin className="h-4 w-4" />
      <AlertTitle>
        {location.city !== "Unknown" ? `${location.city}, ${location.country}` : location.country}
        {error && " (Approximate location)"}
      </AlertTitle>
      <AlertDescription>
        {hasSignificantEarthquakes
          ? `${significantEarthquakes.length} significant earthquakes (M4.0+) detected near your location in the last 7 days.`
          : hasNearbyEarthquakes
            ? `${nearbyEarthquakes.length} minor earthquakes detected near your location in the last 7 days.`
            : "No significant seismic activity near your location in the last 7 days."}
      </AlertDescription>
    </Alert>
  )
}

