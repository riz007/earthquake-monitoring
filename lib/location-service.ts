import type { UserLocation } from "@/types/location";

// Get user location from IP address or browser geolocation
export async function getUserLocation(): Promise<UserLocation> {
  if (typeof window === "undefined") return getDefaultLocation();

  // Try browser geolocation first
  if ("geolocation" in navigator) {
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 7000,
            maximumAge: 60000,
          });
        }
      );

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      // Reverse geocode to get city, region, country
      try {
        const reverseGeoResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
          { headers: { "User-Agent": "Next.js App" } }
        );

        if (reverseGeoResponse.ok) {
          const geoData = await reverseGeoResponse.json();
          return {
            latitude,
            longitude,
            city:
              geoData.address?.city ||
              geoData.address?.town ||
              geoData.address?.village ||
              "Unknown",
            region:
              geoData.address?.state || geoData.address?.county || "Unknown",
            country: geoData.address?.country || "Unknown",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          };
        }
      } catch (geoError) {
        console.error("Reverse geocoding failed:", geoError);
      }

      // If reverse geocoding fails, return only coordinates
      return {
        latitude,
        longitude,
        city: "Unknown",
        region: "Unknown",
        country: "Unknown",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    } catch (geoError) {
      if (geoError instanceof Error) {
        console.warn("Browser geolocation failed:", geoError.message);
      } else {
        console.warn("Browser geolocation failed:", geoError);
      }
    }
  }

  // If browser geolocation fails, use IP-based geolocation
  try {
    const response = await fetch(
      `https://ipinfo.io/json?token=${process.env.NEXT_PUBLIC_IPINFO_TOKEN}`,
      { cache: "no-store" }
    );

    if (response.ok) {
      const data = await response.json();
      const [latitude, longitude] = data.loc ? data.loc.split(",") : [0, 0];

      return {
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
        city: data.city || "Unknown",
        region: data.region || "Unknown",
        country: data.country || "Unknown",
        timezone: data.timezone || "UTC",
      };
    }
  } catch (ipError) {
    console.error("IP geolocation failed:", ipError);
  }

  // Fallback to a default location if everything fails
  return getDefaultLocation();
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
  };
}
