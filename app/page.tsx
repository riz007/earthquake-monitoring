import { Suspense } from "react"
import type { Metadata } from "next"
import EarthquakeMap from "@/components/earthquake-map"
import EarthquakeFeed from "@/components/earthquake-feed"
import UserLocationBanner from "@/components/user-location-banner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import RiskAssessment from "@/components/risk-assessment"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

export const metadata: Metadata = {
  title: "Earthquake Monitor | Thailand & Global",
  description: "Real-time earthquake detection and monitoring for Thailand and worldwide",
}

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-2">Earthquake Monitor</h1>
      <p className="text-muted-foreground mb-6">Real-time earthquake detection and monitoring using USGS data</p>

      <Alert className="mb-6 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-800 dark:text-blue-300">
          This application uses data from the USGS Earthquake Hazards Program. Risk assessments are algorithmic and
          should be verified with official sources.
        </AlertDescription>
      </Alert>

      <Suspense fallback={<Skeleton className="h-16 w-full rounded-lg" />}>
        <UserLocationBanner />
      </Suspense>

      <Tabs defaultValue="map" className="mt-6">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="map">Map View</TabsTrigger>
          <TabsTrigger value="feed">Recent Activity</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
        </TabsList>
        <TabsContent value="map" className="mt-0">
          <div className="h-[600px] rounded-lg overflow-hidden border relative">
            <Suspense fallback={<Skeleton className="h-full w-full" />}>
              <EarthquakeMap />
            </Suspense>
          </div>
        </TabsContent>
        <TabsContent value="feed" className="mt-0">
          <div className="border rounded-lg p-4">
            <Suspense
              fallback={
                <div className="space-y-4">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
              }
            >
              <EarthquakeFeed />
            </Suspense>
          </div>
        </TabsContent>
        <TabsContent value="risk" className="mt-0">
          <div className="border rounded-lg p-4">
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <RiskAssessment />
            </Suspense>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

