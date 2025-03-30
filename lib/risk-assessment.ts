import type { RiskAssessment } from "@/types/risk-assessment"
import { getEarthquakeStatistics, getNearbyEarthquakes } from "./earthquake-service"

// Assess earthquake risk for a location
export async function assessRisk(latitude: number, longitude: number): Promise<RiskAssessment> {
  try {
    // Get earthquake statistics for the region
    const stats = await getEarthquakeStatistics(latitude, longitude, 500, 365)

    // Get recent earthquakes for historical data
    const recentEarthquakes = await getNearbyEarthquakes(latitude, longitude, 500, 365, 4.0)

    // Calculate risk factors based on real data
    const faultLineProximity = calculateFaultLineProximity(stats.count, stats.maxMagnitude)
    const historicalActivity = calculateHistoricalActivity(stats.count, stats.recentActivity)

    // These would ideally come from other data sources
    // For now, we'll use placeholder values based on location
    const buildingVulnerability = calculateBuildingVulnerability(latitude, longitude)
    const populationDensity = calculatePopulationDensity(latitude, longitude)

    // Calculate overall risk as weighted average
    const overallRisk = Math.round(
      faultLineProximity * 0.3 + historicalActivity * 0.3 + buildingVulnerability * 0.2 + populationDensity * 0.2,
    )

    // Format significant events from real data
    const significantEvents = recentEarthquakes
      .sort((a, b) => b.magnitude - a.magnitude)
      .slice(0, 3)
      .map((eq) => ({
        date: new Date(eq.time).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        magnitude: eq.magnitude,
        location: eq.place,
        impact: eq.felt ? `${eq.felt} people reported feeling this earthquake` : "No impact data available",
      }))

    // Generate historical summary based on data
    const historicalSummary = generateHistoricalSummary(stats, recentEarthquakes)

    // Generate recommendations based on risk level
    const recommendations = generateRecommendations(overallRisk)

    return {
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
    }
  } catch (error) {
    console.error("Error assessing risk:", error)

    // Return default risk assessment if there's an error
    return {
      overallRisk: 0,
      faultLineProximity: 0,
      historicalActivity: 0,
      buildingVulnerability: 0,
      populationDensity: 0,
      historicalSummary:
        "Unable to assess risk due to insufficient data. Please consult your local meteorological department for accurate information.",
      significantEvents: [],
      recommendations: [
        "Consult your local meteorological department for accurate seismic risk information",
        "Follow official government guidance for earthquake preparedness",
        "Create an emergency plan with your family or household members",
        "Prepare an emergency kit with essential supplies",
      ],
      disclaimer:
        "DISCLAIMER: This risk assessment is generated algorithmically based on historical seismic data and geographical factors. It is not an official assessment and should not replace guidance from local meteorological departments or government announcements. Always verify information with official sources before making decisions.",
    }
  }
}

// Calculate fault line proximity risk based on earthquake count and max magnitude
function calculateFaultLineProximity(count: number, maxMagnitude: number): number {
  // Higher count and magnitude indicate closer proximity to fault lines
  const countFactor = (Math.min(100, count) / 100) * 50
  const magnitudeFactor = (maxMagnitude / 10) * 50

  return Math.round(countFactor + magnitudeFactor)
}

// Calculate historical activity risk based on earthquake count and recent activity
function calculateHistoricalActivity(count: number, recentActivity: number): number {
  // Higher count and recent activity indicate higher historical activity
  const countFactor = (Math.min(100, count) / 100) * 40
  const recentFactor = (Math.min(10, recentActivity) / 10) * 60

  return Math.round(countFactor + recentFactor)
}

// Calculate building vulnerability based on location
// In a real app, this would use building code data for the region
function calculateBuildingVulnerability(latitude: number, longitude: number): number {
  // This is a simplified estimation based on general geographical regions
  // In a real application, this would use actual building code data

  // Default moderate vulnerability
  let vulnerability = 40

  // Adjust based on known seismic zones and building code enforcement
  // These are very rough approximations and should be replaced with real data

  // Japan (high building codes)
  if (latitude > 30 && latitude < 46 && longitude > 129 && longitude < 146) {
    vulnerability = 30
  }
  // California (good building codes)
  else if (latitude > 32 && latitude < 42 && longitude > -125 && longitude < -114) {
    vulnerability = 35
  }
  // Italy (variable building codes, older structures)
  else if (latitude > 36 && latitude < 47 && longitude > 6 && longitude < 19) {
    vulnerability = 50
  }
  // Nepal, Northern India (variable building codes)
  else if (latitude > 26 && latitude < 31 && longitude > 80 && longitude < 89) {
    vulnerability = 65
  }

  return vulnerability
}

// Calculate population density based on location
// In a real app, this would use population density data
function calculatePopulationDensity(latitude: number, longitude: number): number {
  // This is a simplified estimation based on general geographical regions
  // In a real application, this would use actual population density data

  // Default moderate density
  let density = 40

  // Adjust based on known population centers
  // These are very rough approximations and should be replaced with real data

  // Tokyo area
  if (latitude > 35 && latitude < 36 && longitude > 139 && longitude < 140) {
    density = 85
  }
  // New York area
  else if (latitude > 40 && latitude < 41 && longitude > -74.5 && longitude < -73.5) {
    density = 80
  }
  // Mumbai area
  else if (latitude > 18.5 && latitude < 19.5 && longitude > 72.5 && longitude < 73.5) {
    density = 90
  }
  // Mexico City area
  else if (latitude > 19 && latitude < 20 && longitude > -99.5 && longitude < -98.5) {
    density = 75
  }

  return density
}

// Generate historical summary based on earthquake data
function generateHistoricalSummary(
  stats: { count: number; maxMagnitude: number; recentActivity: number },
  recentEarthquakes: any[],
): string {
  if (stats.count === 0) {
    return "This region has not experienced any significant earthquakes in the past year based on available data. However, this does not guarantee future seismic inactivity. Always consult local geological surveys for comprehensive information."
  }

  const activityLevel = stats.count < 10 ? "low" : stats.count < 50 ? "moderate" : "high"
  const maxMagDescription = stats.maxMagnitude < 4 ? "minor" : stats.maxMagnitude < 5 ? "moderate" : "significant"
  const recentActivityDesc =
    stats.recentActivity < 0.1
      ? "very low"
      : stats.recentActivity < 0.5
        ? "low"
        : stats.recentActivity < 1
          ? "moderate"
          : "high"

  return `Based on USGS data, this region has experienced ${activityLevel} seismic activity in the past year with ${stats.count} recorded earthquakes. The strongest was a ${maxMagDescription} M${stats.maxMagnitude.toFixed(1)} event. Recent activity has been ${recentActivityDesc}. This assessment is based solely on historical data and should be verified with local authorities.`
}

// Generate recommendations based on risk level
function generateRecommendations(riskLevel: number): string[] {
  const baseRecommendations = [
    "Create an emergency plan with your family or household members",
    "Prepare an emergency kit with essential supplies",
    "Learn first aid and how to respond during and after an earthquake",
    "Stay informed about local earthquake alerts and warnings",
    "Consult your local meteorological department for accurate seismic risk information",
  ]

  if (riskLevel < 25) {
    return baseRecommendations
  }

  if (riskLevel < 50) {
    return [
      ...baseRecommendations,
      "Secure heavy furniture and appliances to walls",
      "Know the safe spots in each room (under sturdy tables, against interior walls)",
    ]
  }

  if (riskLevel < 75) {
    return [
      ...baseRecommendations,
      "Secure heavy furniture and appliances to walls",
      "Know the safe spots in each room (under sturdy tables, against interior walls)",
      "Identify building weaknesses and fix them if possible",
      "Practice earthquake drills regularly",
    ]
  }

  // High risk (75+)
  return [
    ...baseRecommendations,
    "Secure heavy furniture and appliances to walls",
    "Know the safe spots in each room (under sturdy tables, against interior walls)",
    "Identify building weaknesses and fix them if possible",
    "Consider retrofitting your home for earthquake safety",
    "Practice earthquake drills regularly",
    "Have multiple evacuation routes planned",
    "Consider earthquake insurance for your property",
  ]
}

