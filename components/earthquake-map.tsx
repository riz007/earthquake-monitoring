"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { useUserLocation } from "@/hooks/use-user-location";
import { getRecentEarthquakes } from "@/lib/earthquake-service";
import type { Earthquake } from "@/types/earthquake";
import dynamic from "next/dynamic";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

// Dynamically import Leaflet with no SSR to avoid hydration issues
const LeafletMap = dynamic(() => import("@/components/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full min-h-[400px] flex items-center justify-center bg-muted/20">
      <div className="flex flex-col items-center gap-2">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    </div>
  ),
});

export default function EarthquakeMap() {
  const router = useRouter();
  const { location } = useUserLocation();
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch earthquake data
    const fetchEarthquakes = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get earthquakes from the last 30 days with magnitude >= 2.5
        const data = await getRecentEarthquakes({
          minmagnitude: 1,
          limit: 2000,
        });

        if (data.length === 0) {
          setError("No earthquake data available. Please try again later.");
        }

        setEarthquakes(data);
      } catch (error) {
        console.error("Failed to fetch earthquake data:", error);
        setError(
          "Failed to fetch earthquake data. Please check your connection and try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEarthquakes();
  }, []);

  if (loading) {
    return (
      <div className="h-full w-full min-h-[400px] flex items-center justify-center bg-muted/20">
        <div className="flex flex-col items-center gap-2">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Loading earthquake data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full min-h-[400px] flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div
      className="h-full w-full min-h-[400px]"
      style={{ height: "600px", position: "relative" }}>
      <LeafletMap
        earthquakes={earthquakes}
        userLocation={location}
        onEarthquakeClick={(id) => router.push(`/earthquake/${id}`)}
      />
    </div>
  );
}
