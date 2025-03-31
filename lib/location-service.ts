import type { UserLocation } from "@/types/location"

// Get user location from IP address or browser geolocation
export async function getUserLocation(): Promise<UserLocation> {
  // Check if we're running on the server
  const isServer = typeof window === "undefined"

  if (isServer) {
    // Return default location when running on server
    return getDefaultLocation()
  }

  try {
    // Try IP-based geolocation first (more reliable in various environments)
    try {
      const response = await fetch("https://ipapi.co/json/", {
        cache: "no-store",
      })

      if (response.ok) {
        const data = await response.json()

        if (!data.error) {
          return {
            latitude: data.latitude || 0,
            longitude: data.longitude || 0,
            city: data.city || "Unknown",
            region: data.region || "Unknown",
            country: data.country_name || data.country || "Unknown",
            timezone: data.timezone || "UTC",
          }
        }
      }
    } catch (ipError) {
      console.error("IP geolocation failed:", ipError)
      // Continue to next method if IP geolocation fails
    }

    // Try alternative IP geolocation service
    try {
      const response = await fetch("https://geolocation-db.com/json/", {
        cache: "no-store",
      })

      if (response.ok) {
        const data = await response.json()

        return {
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
          city: data.city || "Unknown",
          region: data.state || "Unknown",
          country: data.country_name || "Unknown",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
      }
    } catch (altIpError) {
      console.error("Alternative IP geolocation failed:", altIpError)
      // Continue to next method if alternative IP geolocation fails
    }

    // Only try browser geolocation as a last resort
    // (since it often fails due to permission policies)
    if ("geolocation" in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 60000,
          })
        })

        // We need to do a reverse geocoding to get city/country info
        try {
          const reverseGeoResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=10`,
            { headers: { "User-Agent": "EarthquakeMonitor/1.0" } },
          )

          if (reverseGeoResponse.ok) {
            const geoData = await reverseGeoResponse.json()
            return {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              city: geoData.address?.city || geoData.address?.town || geoData.address?.village || "Unknown",
              region: geoData.address?.state || geoData.address?.county || "Unknown",
              country: geoData.address?.country || "Unknown",
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            }
          }
        } catch (geoError) {
          console.error("Reverse geocoding failed:", geoError)
        }

        // If reverse geocoding fails, return coordinates only
        return {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          city: "Unknown",
          region: "Unknown",
          country: "Unknown",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
      } catch (geoError) {
        console.error("Browser geolocation failed:", geoError)
        // Fall through to default location
      }
    }

    // If all methods fail, use default location
    return getDefaultLocation()
  } catch (error) {
    console.error("Error getting user location:", error)

    // Final fallback to default location
    return getDefaultLocation()
  }
}

// Helper function to get a default location
function getDefaultLocation(): UserLocation {
  return {
    latitude: 13.7563,
    longitude: 100.5018,
    city: "Bangkok",
    region: "Bangkok",
    country: "Thailand",
    timezone: "Asia/Bangkok",
  }
}

