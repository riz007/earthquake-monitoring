"use client"
import { Loader } from "lucide-react"
import type { Earthquake } from "@/types/earthquake"
import dynamic from "next/dynamic"

// Dynamically import Leaflet with no SSR to avoid hydration issues
const LeafletDetailMap = dynamic(() => import("@/components/leaflet-detail-map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full min-h-[400px] flex items-center justify-center bg-muted/20">
      <div className="flex flex-col items-center gap-2">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    </div>
  ),
})

interface EarthquakeDetailMapProps {
  earthquake: Earthquake
}

export default function EarthquakeDetailMap({ earthquake }: EarthquakeDetailMapProps) {
  // Update the map container to ensure proper dimensions
  return (
    <div className="h-full w-full min-h-[400px]" style={{ height: "400px", position: "relative" }}>
      <LeafletDetailMap earthquake={earthquake} />
    </div>
  )
}

