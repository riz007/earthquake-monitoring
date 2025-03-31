"use client";

import { useEffect, useState } from "react";
import { useUserLocation } from "@/hooks/use-user-location";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Loader,
  AlertTriangle,
  CheckCircle,
  Info,
  AlertCircle,
  MapPin,
} from "lucide-react";
import {
  getNearbyEarthquakes,
  getEarthquakeStatistics,
} from "@/lib/earthquake-service";
import type { RiskAssessment as RiskAssessmentType } from "@/types/risk-assessment";

export default function RiskAssessment() {
  const { location, loading, error, retryLocation } = useUserLocation();
  const [risk, setRisk] = useState<RiskAssessmentType | null>(null);
  const [assessing, setAssessing] = useState(false);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRiskAssessment = async () => {
      if (location) {
        setAssessing(true);
        setAssessmentError(null);
        try {
          // Get earthquake statistics for the region
          const stats = await getEarthquakeStatistics(
            location.latitude,
            location.longitude,
            500,
            365
          );

          // Get recent earthquakes for historical data
          const recentEarthquakes = await getNearbyEarthquakes(
            location.latitude,
            location.longitude,
            500,
            365,
            4.0
          );

          // Calculate risk factors based on real data
          const faultLineProximity = calculateFaultLineProximity(
            stats.count,
            stats.maxMagnitude
          );
          const historicalActivity = calculateHistoricalActivity(
            stats.count,
            stats.recentActivity
          );

          // Calculate building vulnerability based on location and historical data
          const buildingVulnerability = calculateBuildingVulnerability(
            location.latitude,
            location.longitude,
            stats.maxMagnitude
          );

          // Calculate population density risk based on location
          const populationDensity = calculatePopulationDensity(
            location.latitude,
            location.longitude
          );

          // Calculate overall risk as weighted average
          const overallRisk = Math.round(
            faultLineProximity * 0.3 +
              historicalActivity * 0.3 +
              buildingVulnerability * 0.2 +
              populationDensity * 0.2
          );

          // Format significant events from real data
          const significantEvents = recentEarthquakes
            .sort((a, b) => b.magnitude - a.magnitude)
            .slice(0, 3)
            .map((eq) => ({
              date: new Date(eq.time).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              magnitude: eq.magnitude,
              location: eq.place,
              impact: eq.felt
                ? `${eq.felt} people reported feeling this earthquake`
                : "No impact data available",
            }));

          // Generate historical summary based on data
          const historicalSummary = generateHistoricalSummary(
            stats,
            recentEarthquakes
          );

          // Generate recommendations based on risk level
          const recommendations = generateRecommendations(
            overallRisk,
            stats.maxMagnitude
          );

          setRisk({
            overallRisk,
            faultLineProximity,
            historicalActivity,
            buildingVulnerability,
            populationDensity,
            historicalSummary,
            significantEvents,
            recommendations,
            disclaimer:
              "DISCLAIMER: This risk assessment is generated algorithmically based on historical seismic data and geographical factors. It is not an official assessment and should not replace guidance from local meteorological departments or government announcements. Always verify information with official sources before making decisions.",
          });
        } catch (err) {
          console.error("Failed to assess risk:", err);
          setAssessmentError(
            "Failed to assess seismic risk. Please try again later."
          );
        } finally {
          setAssessing(false);
        }
      }
    };

    fetchRiskAssessment();
  }, [location]);

  if (loading || assessing) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Detecting your location..."
              : "Analyzing seismic data..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            We couldn't detect your location. Please enable location services in
            your browser.
          </AlertDescription>
        </Alert>

        <div className="flex justify-center mt-4">
          <Button onClick={retryLocation}>Retry Location Detection</Button>
        </div>

        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900 mt-4">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-300">
            Risk assessment requires your location to analyze nearby seismic
            activity. Please enable location services in your browser settings
            and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (assessmentError) {
    return (
      <Alert variant="destructive" className="my-8">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{assessmentError}</AlertDescription>
      </Alert>
    );
  }

  if (!risk) return null;

  const getRiskColor = (level: number) => {
    if (level < 25) return "bg-emerald-500";
    if (level < 50) return "bg-amber-500";
    if (level < 75) return "bg-orange-500";
    return "bg-red-600";
  };

  const getRiskIcon = (level: number) => {
    if (level < 25) return <CheckCircle className="h-5 w-5 text-emerald-500" />;
    if (level < 50) return <Info className="h-5 w-5 text-amber-500" />;
    if (level < 75)
      return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  const getRiskText = (level: number) => {
    if (level < 25) return "Low";
    if (level < 50) return "Moderate";
    if (level < 75) return "High";
    return "Very High";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Seismic Risk Assessment</h2>
        <p className="text-muted-foreground flex items-center">
          <MapPin className="h-4 w-4 mr-1" />
          Based on your location: {location?.city}, {location?.country}
        </p>
      </div>

      <Alert
        variant="warning"
        className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900">
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-800 dark:text-amber-300">
          This assessment is for informational purposes only and is based on
          historical data from USGS. Always refer to official sources for
          critical decisions.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getRiskIcon(risk.overallRisk)}
            Overall Risk: {getRiskText(risk.overallRisk)}
          </CardTitle>
          <CardDescription>
            Based on your location and historical seismic data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Overall Risk</span>
                <span className="text-sm font-medium">{risk.overallRisk}%</span>
              </div>
              <Progress
                value={risk.overallRisk}
                className={getRiskColor(risk.overallRisk)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="factors">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="factors">Risk Factors</TabsTrigger>
          <TabsTrigger value="history">Historical Data</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="factors" className="space-y-4 mt-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">
                Proximity to Fault Lines
              </span>
              <span className="text-sm font-medium">
                {risk.faultLineProximity}%
              </span>
            </div>
            <Progress
              value={risk.faultLineProximity}
              className={getRiskColor(risk.faultLineProximity)}
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">
                Historical Seismic Activity
              </span>
              <span className="text-sm font-medium">
                {risk.historicalActivity}%
              </span>
            </div>
            <Progress
              value={risk.historicalActivity}
              className={getRiskColor(risk.historicalActivity)}
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">
                Building Vulnerability
              </span>
              <span className="text-sm font-medium">
                {risk.buildingVulnerability}%
              </span>
            </div>
            <Progress
              value={risk.buildingVulnerability}
              className={getRiskColor(risk.buildingVulnerability)}
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Population Density</span>
              <span className="text-sm font-medium">
                {risk.populationDensity}%
              </span>
            </div>
            <Progress
              value={risk.populationDensity}
              className={getRiskColor(risk.populationDensity)}
            />
          </div>

          <Alert
            variant="warning"
            className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900 mt-4">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-800 dark:text-blue-300 text-xs">
              Building vulnerability and population density are estimated based
              on geographical data and may not reflect actual conditions in your
              specific location.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <h3 className="font-medium">
                  Historical Earthquakes in Your Region
                </h3>
                <p className="text-sm text-muted-foreground">
                  {risk.historicalSummary}
                </p>

                {risk.significantEvents.length > 0 ? (
                  <div className="border rounded-md p-4 mt-4">
                    <h4 className="font-medium mb-2">Significant Events</h4>
                    <ul className="space-y-2 text-sm">
                      {risk.significantEvents.map((event, index) => (
                        <li key={index} className="flex justify-between">
                          <span>
                            {event.date}: M{event.magnitude.toFixed(1)} -{" "}
                            {event.location}
                          </span>
                          <span className="text-muted-foreground">
                            {event.impact}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No significant events found in your region.
                  </p>
                )}

                <Alert
                  variant="warning"
                  className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900 mt-4">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-300 text-xs">
                    Historical data is based on USGS records and may not include
                    all seismic events in your area. Past activity is not always
                    predictive of future events.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <h3 className="font-medium">Safety Recommendations</h3>
                <p className="text-sm text-muted-foreground">
                  Based on your location and historical seismic data:
                </p>

                <ul className="space-y-2 text-sm">
                  {risk.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>

                <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900 mt-4">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-800 dark:text-red-300 text-xs">
                    {risk.disclaimer}
                  </AlertDescription>
                </Alert>

                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-2 text-sm">
                    Official Resources
                  </h4>
                  <ul className="space-y-1 text-xs">
                    <li>
                      <a
                        href="https://www.ready.gov/earthquakes"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline">
                        Ready.gov Earthquake Preparedness
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/earthquake.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline">
                        Red Cross Earthquake Safety
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.who.int/news-room/fact-sheets/detail/earthquakes"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline">
                        WHO Earthquake Health Guidelines
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Calculate fault line proximity risk based on earthquake count and max magnitude
function calculateFaultLineProximity(
  count: number,
  maxMagnitude: number
): number {
  // Higher count and magnitude indicate closer proximity to fault lines
  // Use a logarithmic scale for count to prevent extreme values
  const countFactor = Math.min(60, Math.log10(count + 1) * 20);

  // Magnitude factor is more important for fault line proximity
  const magnitudeFactor = Math.min(40, maxMagnitude * 8);

  return Math.round(countFactor + magnitudeFactor);
}

// Calculate historical activity risk based on earthquake count and recent activity
function calculateHistoricalActivity(
  count: number,
  recentActivity: number
): number {
  // Use a logarithmic scale for count to prevent extreme values
  const countFactor = Math.min(40, Math.log10(count + 1) * 15);

  // Recent activity is weighted more heavily
  const recentFactor = Math.min(60, recentActivity * 30);

  return Math.round(countFactor + recentFactor);
}

// Calculate building vulnerability based on location and historical data
function calculateBuildingVulnerability(
  latitude: number,
  longitude: number,
  maxMagnitude: number
): number {
  // Base vulnerability on historical maximum magnitude
  // Higher historical magnitudes indicate need for better building codes
  let vulnerability = Math.min(50, maxMagnitude * 10);

  // Adjust based on known seismic zones and building code enforcement
  // These are approximations based on general knowledge of building codes by region

  // Regions with advanced building codes
  const advancedCodeRegions = [
    { lat: [30, 46], lng: [129, 146], factor: 0.7 }, // Japan
    { lat: [32, 42], lng: [-125, -114], factor: 0.75 }, // California
    { lat: [35, 48], lng: [5, 15], factor: 0.8 }, // Northern Italy, Switzerland
    { lat: [-48, -33], lng: [165, 179], factor: 0.75 }, // New Zealand
    { lat: [47, 60], lng: [5, 20], factor: 0.7 }, // Scandinavia
  ];

  // Regions with moderate building codes
  const moderateCodeRegions = [
    { lat: [35, 43], lng: [20, 30], factor: 1.0 }, // Greece, Turkey
    { lat: [18, 30], lng: [-110, -86], factor: 1.0 }, // Mexico
    { lat: [-40, -30], lng: [-75, -65], factor: 1.0 }, // Chile
    { lat: [30, 40], lng: [100, 115], factor: 1.0 }, // Central China
  ];

  // Regions with variable or less stringent building codes
  const variableCodeRegions = [
    { lat: [8, 20], lng: [70, 85], factor: 1.3 }, // India
    { lat: [26, 31], lng: [80, 89], factor: 1.3 }, // Nepal
    { lat: [-10, 10], lng: [95, 130], factor: 1.2 }, // Indonesia
    { lat: [10, 20], lng: [-105, -85], factor: 1.2 }, // Central America
  ];

  // Check if location is in any of the defined regions
  for (const region of advancedCodeRegions) {
    if (isInRegion(latitude, longitude, region.lat, region.lng)) {
      vulnerability *= region.factor;
      break;
    }
  }

  for (const region of moderateCodeRegions) {
    if (isInRegion(latitude, longitude, region.lat, region.lng)) {
      vulnerability *= region.factor;
      break;
    }
  }

  for (const region of variableCodeRegions) {
    if (isInRegion(latitude, longitude, region.lat, region.lng)) {
      vulnerability *= region.factor;
      break;
    }
  }

  // Ensure the value is within 0-100 range
  return Math.round(Math.min(100, Math.max(0, vulnerability)));
}

// Calculate population density based on location
function calculatePopulationDensity(
  latitude: number,
  longitude: number
): number {
  // Default moderate density
  let density = 40;

  // Major urban centers with high population density
  const highDensityCities = [
    { lat: 35.6895, lng: 139.6917, name: "Tokyo", radius: 1, density: 85 },
    { lat: 40.7128, lng: -74.006, name: "New York", radius: 1, density: 80 },
    { lat: 19.076, lng: 72.8777, name: "Mumbai", radius: 1, density: 90 },
    {
      lat: 19.4326,
      lng: -99.1332,
      name: "Mexico City",
      radius: 1,
      density: 75,
    },
    {
      lat: 37.7749,
      lng: -122.4194,
      name: "San Francisco",
      radius: 1,
      density: 70,
    },
    {
      lat: 34.0522,
      lng: -118.2437,
      name: "Los Angeles",
      radius: 1,
      density: 65,
    },
    { lat: 41.9028, lng: 12.4964, name: "Rome", radius: 1, density: 60 },
    { lat: 37.9838, lng: 23.7275, name: "Athens", radius: 1, density: 65 },
    { lat: 39.9042, lng: 116.4074, name: "Beijing", radius: 1, density: 80 },
    { lat: 31.2304, lng: 121.4737, name: "Shanghai", radius: 1, density: 85 },
    { lat: 13.7563, lng: 100.5018, name: "Bangkok", radius: 1, density: 70 },
    { lat: -6.2088, lng: 106.8456, name: "Jakarta", radius: 1, density: 75 },
    { lat: -33.8688, lng: 151.2093, name: "Sydney", radius: 1, density: 60 },
    {
      lat: -34.6037,
      lng: -58.3816,
      name: "Buenos Aires",
      radius: 1,
      density: 65,
    },
    { lat: -23.5505, lng: -46.6333, name: "São Paulo", radius: 1, density: 70 },
  ];

  // Check if location is near any major city
  for (const city of highDensityCities) {
    const distance = calculateDistance(latitude, longitude, city.lat, city.lng);
    if (distance < city.radius) {
      density = city.density;
      break;
    } else if (distance < 2) {
      // If within 2 degrees (roughly 200km), adjust density based on distance
      density = Math.max(density, city.density - (distance - city.radius) * 15);
    }
  }

  return Math.round(density);
}

// Helper function to check if coordinates are within a region
function isInRegion(
  lat: number,
  lng: number,
  latRange: number[],
  lngRange: number[]
): boolean {
  return (
    lat >= latRange[0] &&
    lat <= latRange[1] &&
    lng >= lngRange[0] &&
    lng <= lngRange[1]
  );
}

// Helper function to calculate distance between two coordinates (in degrees)
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lng1 - lng2, 2));
}

// Generate historical summary based on earthquake data
function generateHistoricalSummary(
  stats: { count: number; maxMagnitude: number; recentActivity: number },
  recentEarthquakes: any[]
): string {
  if (stats.count === 0) {
    return "This region has not experienced any significant earthquakes in the past year based on available data. However, this does not guarantee future seismic inactivity. Always consult local geological surveys for comprehensive information.";
  }

  // Determine activity level based on count and magnitude
  let activityLevel;
  if (stats.count < 5) {
    activityLevel = "very low";
  } else if (stats.count < 20) {
    activityLevel = "low";
  } else if (stats.count < 50) {
    activityLevel = "moderate";
  } else if (stats.count < 100) {
    activityLevel = "high";
  } else {
    activityLevel = "very high";
  }

  // Describe the maximum magnitude
  const maxMagDescription =
    stats.maxMagnitude < 4
      ? "minor"
      : stats.maxMagnitude < 5
      ? "moderate"
      : stats.maxMagnitude < 6
      ? "significant"
      : "major";

  // Describe recent activity trend
  const recentActivityDesc =
    stats.recentActivity < 0.1
      ? "very low"
      : stats.recentActivity < 0.5
      ? "low"
      : stats.recentActivity < 1
      ? "moderate"
      : stats.recentActivity < 2
      ? "high"
      : "very high";

  // Count significant earthquakes (M4.0+)
  const significantCount = recentEarthquakes.filter(
    (eq) => eq.magnitude >= 4.0
  ).length;
  const significantText =
    significantCount > 0
      ? ` including ${significantCount} significant event${
          significantCount !== 1 ? "s" : ""
        } of magnitude 4.0 or greater`
      : "";

  return `Based on USGS data, this region has experienced ${activityLevel} seismic activity in the past year with ${
    stats.count
  } recorded earthquakes${significantText}. The strongest was a ${maxMagDescription} M${stats.maxMagnitude.toFixed(
    1
  )} event. Recent activity has been ${recentActivityDesc}. This assessment is based on historical data and should be verified with local authorities.`;
}

// Generate recommendations based on risk level and maximum magnitude
function generateRecommendations(
  riskLevel: number,
  maxMagnitude: number
): string[] {
  const baseRecommendations = [
    "Create an emergency plan with your family or household members",
    "Prepare an emergency kit with essential supplies",
    "Learn first aid and how to respond during and after an earthquake",
    "Stay informed about local earthquake alerts and warnings",
  ];

  // Low risk (0-25)
  if (riskLevel < 25) {
    return [
      ...baseRecommendations,
      "Familiarize yourself with earthquake safety procedures even in low-risk areas",
    ];
  }

  // Moderate risk (25-50)
  if (riskLevel < 50) {
    return [
      ...baseRecommendations,
      "Secure heavy furniture and appliances to walls",
      "Know the safe spots in each room (under sturdy tables, against interior walls)",
      "Identify and fix potential hazards in your home",
    ];
  }

  // High risk (50-75)
  if (riskLevel < 75) {
    return [
      ...baseRecommendations,
      "Secure heavy furniture and appliances to walls",
      "Know the safe spots in each room (under sturdy tables, against interior walls)",
      "Identify building weaknesses and fix them if possible",
      "Practice earthquake drills regularly",
      "Learn about your building's seismic safety features",
    ];
  }

  // Very high risk (75-100)
  return [
    ...baseRecommendations,
    "Secure heavy furniture and appliances to walls",
    "Know the safe spots in each room (under sturdy tables, against interior walls)",
    "Identify building weaknesses and fix them if possible",
    "Consider retrofitting your home for earthquake safety",
    "Practice earthquake drills regularly",
    "Have multiple evacuation routes planned",
    "Consider earthquake insurance for your property",
    "Learn about tsunami evacuation routes if you're in a coastal area",
  ];
}
