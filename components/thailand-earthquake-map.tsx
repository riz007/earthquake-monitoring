"use client";

import { Loader, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { TMDEarthquake } from "@/types/tmd-earthquake";
import dynamic from "next/dynamic";

// Dynamically import Leaflet with no SSR to avoid hydration issues
const LeafletMap = dynamic(() => import("@/components/leaflet-map-tmd"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full min-h-[400px] flex items-center justify-center bg-muted/20">
      <div className="flex flex-col items-center gap-2">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">กำลังโหลดแผนที่...</p>
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    </div>
  ),
});

interface ThailandEarthquakeMapProps {
  earthquakes: TMDEarthquake[];
  loading: boolean;
  error: string | null;
}

export default function ThailandEarthquakeMap({
  earthquakes,
  loading,
  error,
}: ThailandEarthquakeMapProps) {
  if (loading) {
    return (
      <div className="h-full w-full min-h-[400px] flex items-center justify-center bg-muted/20">
        <div className="flex flex-col items-center gap-2">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            กำลังโหลดข้อมูลแผ่นดินไหว...
          </p>
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

  if (earthquakes.length === 0) {
    return (
      <div className="h-full w-full min-h-[400px] flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            ไม่พบข้อมูลแผ่นดินไหวที่ตรงกับเงื่อนไขการค้นหา
            <br />
            No earthquake data matching your filter criteria
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div
      className="h-full w-full min-h-[400px]"
      style={{ height: "600px", position: "relative" }}>
      <LeafletMap earthquakes={earthquakes} />
    </div>
  );
}
