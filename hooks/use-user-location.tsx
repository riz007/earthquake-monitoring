"use client";

import { useState, useEffect } from "react";
import { getUserLocation } from "@/lib/location-service";
import type { UserLocation } from "@/types/location";

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      // Add a small delay to prevent immediate failures
      await new Promise((resolve) => setTimeout(resolve, 100));
      const userLocation = await getUserLocation();
      setLocation(userLocation);

      // If we're using the default location, still set an error
      // but we'll have location data to work with
      if (
        userLocation.city === "Bangkok" &&
        userLocation.country === "Thailand"
      ) {
        setError("Using default location");
      } else {
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching user location:", err);
      setError(
        err instanceof Error ? err.message : "Failed to detect location"
      );

      // Try to get default location even if there's an error
      try {
        const defaultLocation = {
          latitude: 13.7563,
          longitude: 100.5018,
          city: "Bangkok",
          region: "Bangkok",
          country: "Thailand",
          timezone: "Asia/Bangkok",
        };
        setLocation(defaultLocation);
      } catch (defaultErr) {
        // If even getting the default location fails, set location to null
        setLocation(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to retry location detection
  const retryLocation = () => {
    fetchLocation();
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  return { location, loading, error, retryLocation };
}
