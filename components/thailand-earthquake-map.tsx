"use client"

import { useEffect, useState } from "react"
import { Loader, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getTMDEarthquakes } from "@/lib/tmd-earthquake-service"
import type { TMDEarthquake } from "@/types/tmd-earthquake"
import dynamic from "next/dynamic"

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
})

export default function ThailandEarthquakeMap() {
  const [earthquakes, setEarthquakes] = useState<TMDEarthquake[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEarthquakes = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getTMDEarthquakes()
        setEarthquakes(data)
      } catch (error) {
        console.error("Failed to fetch TMD earthquake data:", error)
        setError("Failed to fetch earthquake data. Please check your connection and try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchEarthquakes()
  }, [])

  if (loading) {
    return (
      <div className="h-full w-full min-h-[400px] flex items-center justify-center bg-muted/20">
        <div className="flex flex-col items-center gap-2">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">กำลังโหลดข้อมูลแผ่นดินไหว...</p>
          <p className="text-sm text-muted-foreground">Loading earthquake data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full w-full min-h-[400px] flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="h-full w-full min-h-[400px]" style={{ height: "600px", position: "relative" }}>
      <LeafletMap earthquakes={earthquakes} />
    </div>
  )
}

