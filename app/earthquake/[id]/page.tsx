import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { getEarthquakeById } from "@/lib/earthquake-service";
import EarthquakeDetailMap from "@/components/earthquake-detail-map";
import { formatDistanceToNow, format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const earthquake = await getEarthquakeById(params.id);

    if (earthquake.place === "Location unavailable") {
      return {
        title: `Earthquake ${params.id} | Limited Data Available`,
        description: `Limited information available for earthquake ${params.id}`,
      };
    }

    return {
      title: `M${earthquake.magnitude} Earthquake near ${earthquake.place} | Earthquake Monitor`,
      description: `Details about the M${
        earthquake.magnitude
      } earthquake near ${earthquake.place} on ${format(
        new Date(earthquake.time),
        "PPP"
      )}`,
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Earthquake Details | Earthquake Monitor",
    };
  }
}

export default async function EarthquakeDetailPage({
  params: { id },
}: {
  params: { id: string };
}) {
  try {
    // Fetch earthquake data using the awaited `id`
    const earthquake = await getEarthquakeById(id);

    if (!earthquake) {
      return <div>Error: Earthquake not found</div>;
    }

    // Check if it's limited data
    const isLimitedData = earthquake?.place === "Location unavailable";

    if (isLimitedData) {
      return (
        <main className="container mx-auto px-4 py-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4 pl-0">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>

          <Alert className="mb-6 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-300">
              Limited data available for earthquake ID: {id}. This earthquake
              may be archived or removed from the USGS database.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Limited Earthquake Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                We found a reference to this earthquake, but complete data is
                not available in the USGS API.
              </p>

              <p className="mb-6 text-sm text-muted-foreground">
                This typically happens with older earthquakes or those that have
                been revised or removed from the active database.
              </p>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">
                  Available Information
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Earthquake ID:{" "}
                    <span className="font-mono">{earthquake.id}</span>
                  </li>
                  {earthquake.url && (
                    <li>
                      <a
                        href={earthquake.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                        USGS Event Page{" "}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </li>
                  )}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/">
                  <Button>Return to Dashboard</Button>
                </Link>
                <a
                  href={`https://earthquake.usgs.gov/earthquakes/eventpage/${earthquake.id}`}
                  target="_blank"
                  rel="noopener noreferrer">
                  <Button variant="outline">
                    View on USGS <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </main>
      );
    }

    // Helper functions
    const getMagnitudeColor = (magnitude: number) => {
      if (magnitude < 4.0) return "bg-green-500 text-white";
      if (magnitude < 5.0) return "bg-yellow-500 text-black";
      if (magnitude < 6.0) return "bg-orange-500 text-white";
      return "bg-red-500 text-white";
    };

    const getAlertBadge = () => {
      if (!earthquake.alert) return null;

      const alertColors: Record<string, string> = {
        green: "bg-green-100 text-green-800 border-green-200",
        yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
        orange: "bg-orange-100 text-orange-800 border-orange-200",
        red: "bg-red-100 text-red-800 border-red-200",
      };

      return (
        <Badge
          variant="outline"
          className={`ml-2 ${alertColors[earthquake.alert] || ""}`}>
          <AlertTriangle className="mr-1 h-3 w-3" />
          {earthquake.alert.toUpperCase()} Alert
        </Badge>
      );
    };

    return (
      <main className="container mx-auto px-4 py-6">
        <Link href="/">
          <Button variant="ghost" className="mb-4 pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="flex items-center gap-4 mb-4">
              <Badge
                className={`text-lg py-1 px-3 ${getMagnitudeColor(
                  earthquake.magnitude
                )}`}>
                M{earthquake.magnitude.toFixed(1)}
              </Badge>
              <h1 className="text-2xl font-bold">{earthquake.place}</h1>
              {getAlertBadge()}
            </div>

            <div className="flex flex-wrap gap-4 mb-6 text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                {format(new Date(earthquake.time), "PPP")}
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                {format(new Date(earthquake.time), "p")}
                <span className="ml-2 text-sm">
                  (
                  {formatDistanceToNow(new Date(earthquake.time), {
                    addSuffix: true,
                  })}
                  )
                </span>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                {earthquake.depth.toFixed(1)} km depth
              </div>
            </div>

            <div className="h-[400px] rounded-lg overflow-hidden border mb-6">
              <Suspense fallback={<Skeleton className="h-full w-full" />}>
                <EarthquakeDetailMap earthquake={earthquake} />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error("Error rendering earthquake detail page:", error);
    return (
      <main className="container mx-auto px-4 py-6">
        <Link href="/">
          <Button variant="ghost" className="mb-4 pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>

        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            An error occurred while loading earthquake data for ID: {id}
          </AlertDescription>
        </Alert>
      </main>
    );
  }
}
