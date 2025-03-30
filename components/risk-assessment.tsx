"use client"

import { useEffect, useState } from "react"
import { useUserLocation } from "@/hooks/use-user-location"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader, AlertTriangle, CheckCircle, Info, AlertCircle } from "lucide-react"
import { assessRisk } from "@/lib/risk-assessment"
import type { RiskAssessment as RiskAssessmentType } from "@/types/risk-assessment"

export default function RiskAssessment() {
  const { location, loading, error } = useUserLocation()
  const [risk, setRisk] = useState<RiskAssessmentType | null>(null)
  const [assessing, setAssessing] = useState(false)

  useEffect(() => {
    const fetchRiskAssessment = async () => {
      if (location) {
        setAssessing(true)
        try {
          const riskData = await assessRisk(location.latitude, location.longitude)
          setRisk(riskData)
        } catch (err) {
          console.error("Failed to assess risk:", err)
        } finally {
          setAssessing(false)
        }
      }
    }

    fetchRiskAssessment()
  }, [location])

  if (loading || assessing) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{loading ? "Detecting your location..." : "Loading..."}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-8">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          We couldn't detect your location. Please enable location services in your browser.
        </AlertDescription>
      </Alert>
    )
  }

  if (!risk) return null

  const getRiskColor = (level: number) => {
    if (level < 25) return "bg-emerald-500"
    if (level < 50) return "bg-amber-500"
    if (level < 75) return "bg-orange-500"
    return "bg-red-600"
  }

  const getRiskIcon = (level: number) => {
    if (level < 25) return <CheckCircle className="h-5 w-5 text-emerald-500" />
    if (level < 50) return <Info className="h-5 w-5 text-amber-500" />
    if (level < 75) return <AlertTriangle className="h-5 w-5 text-orange-500" />
    return <AlertTriangle className="h-5 w-5 text-red-600" />
  }

  const getRiskText = (level: number) => {
    if (level < 25) return "Low"
    if (level < 50) return "Moderate"
    if (level < 75) return "High"
    return "Very High"
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Seismic Risk Assessment</h2>
        <p className="text-muted-foreground">
          Based on your location and historical seismic data: {location?.city}, {location?.country}
        </p>
      </div>

      <Alert variant="warning" className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900">
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-800 dark:text-amber-300">
          This assessment is for informational purposes only and is based on historical data from USGS. Always refer to
          official sources for critical decisions.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getRiskIcon(risk.overallRisk)}
            Overall Risk: {getRiskText(risk.overallRisk)}
          </CardTitle>
          <CardDescription>Based on your location and historical seismic data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Overall Risk</span>
                <span className="text-sm font-medium">{risk.overallRisk}%</span>
              </div>
              <Progress value={risk.overallRisk} className={getRiskColor(risk.overallRisk)} />
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
              <span className="text-sm font-medium">Proximity to Fault Lines</span>
              <span className="text-sm font-medium">{risk.faultLineProximity}%</span>
            </div>
            <Progress value={risk.faultLineProximity} className={getRiskColor(risk.faultLineProximity)} />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Historical Seismic Activity</span>
              <span className="text-sm font-medium">{risk.historicalActivity}%</span>
            </div>
            <Progress value={risk.historicalActivity} className={getRiskColor(risk.historicalActivity)} />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Building Vulnerability</span>
              <span className="text-sm font-medium">{risk.buildingVulnerability}%</span>
            </div>
            <Progress value={risk.buildingVulnerability} className={getRiskColor(risk.buildingVulnerability)} />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Population Density</span>
              <span className="text-sm font-medium">{risk.populationDensity}%</span>
            </div>
            <Progress value={risk.populationDensity} className={getRiskColor(risk.populationDensity)} />
          </div>

          <Alert variant="warning" className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900 mt-4">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-800 dark:text-blue-300 text-xs">
              Building vulnerability and population density are estimated based on geographical data and may not reflect
              actual conditions in your specific location.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <h3 className="font-medium">Historical Earthquakes in Your Region</h3>
                <p className="text-sm text-muted-foreground">{risk.historicalSummary}</p>

                {risk.significantEvents.length > 0 ? (
                  <div className="border rounded-md p-4 mt-4">
                    <h4 className="font-medium mb-2">Significant Events</h4>
                    <ul className="space-y-2 text-sm">
                      {risk.significantEvents.map((event, index) => (
                        <li key={index} className="flex justify-between">
                          <span>
                            {event.date}: M{event.magnitude} - {event.location}
                          </span>
                          <span className="text-muted-foreground">{event.impact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No significant events found in your region.</p>
                )}

                <Alert
                  variant="warning"
                  className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900 mt-4"
                >
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-300 text-xs">
                    Historical data is based on USGS records and may not include all seismic events in your area. Past
                    activity is not always predictive of future events.
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
                <p className="text-sm text-muted-foreground">Based on your location and historical seismic data:</p>

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
                  <h4 className="font-medium mb-2 text-sm">Official Resources</h4>
                  <ul className="space-y-1 text-xs">
                    <li>
                      <a
                        href="https://www.ready.gov/earthquakes"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Ready.gov Earthquake Preparedness
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/earthquake.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Red Cross Earthquake Safety
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.who.int/news-room/fact-sheets/detail/earthquakes"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
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
  )
}

