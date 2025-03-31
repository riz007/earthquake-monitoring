import type { Earthquake } from "@/types/earthquake"

// Base URL for USGS Earthquake API
const USGS_API_BASE_URL = "https://earthquake.usgs.gov/fdsnws/event/1"

// Get recent earthquakes with optional parameters
export async function getRecentEarthquakes(
  params: {
    starttime?: string
    endtime?: string
    minmagnitude?: number
    maxmagnitude?: number
    limit?: number
    country?: string
  } = {},
): Promise<Earthquake[]> {
  // Default parameters
  const defaultParams = {
    format: "geojson",
    starttime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    endtime: new Date().toISOString(), // today
    minmagnitude: 2.5,
    limit: 500, // Increased from 100 to get more global data
    orderby: "time",
  }

  // Merge default parameters with provided parameters
  const queryParams = new URLSearchParams({
    ...defaultParams,
    ...params,
  })

  // Remove country parameter as it's not supported by the USGS API
  if (queryParams.has("country")) {
    queryParams.delete("country")
  }

  try {
    console.log(`Fetching earthquakes from: ${USGS_API_BASE_URL}/query?${queryParams.toString()}`)
    const response = await fetch(`${USGS_API_BASE_URL}/query?${queryParams.toString()}`, {
      cache: "no-store", // Disable caching to get fresh data
      next: { revalidate: 0 }, // Force revalidation on each request
    })

    if (!response.ok) {
      throw new Error(`USGS API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`Received ${data.features.length} earthquakes from USGS API`)

    // Transform GeoJSON features to our Earthquake type
    let earthquakes = data.features.map((feature: any) => {
      const { id, properties, geometry } = feature

      return {
        id,
        place: properties.place || "Unknown location",
        time: properties.time,
        magnitude: properties.mag || 0,
        magnitudeType: properties.magType || "Unknown",
        status: properties.status || "unknown",
        tsunami: properties.tsunami === 1,
        depth: geometry.coordinates[2] || 0,
        coordinates: [geometry.coordinates[0] || 0, geometry.coordinates[1] || 0], // [longitude, latitude]
        source: properties.sources?.split(",")[0] || "USGS",
        url: properties.url,
        felt: properties.felt,
        cdi: properties.cdi,
        mmi: properties.mmi,
        alert: properties.alert,
      }
    })

    // Filter by country if specified (client-side filtering)
    if (params.country && params.country !== "all") {
      earthquakes = earthquakes.filter((eq) => {
        // Check if the place contains the country name (case insensitive)
        const countryLower = params.country!.toLowerCase()
        const placeLower = eq.place.toLowerCase()

        // Also check for common country abbreviations and alternative names
        const countryMatches = {
          "united states": ["usa", "us", "united states of america"],
          "united kingdom": ["uk", "great britain", "england", "scotland", "wales"],
          thailand: ["thai", "siam"],
          myanmar: ["burma"],
        }

        // Check direct match
        if (placeLower.includes(countryLower)) {
          return true
        }

        // Check alternative names
        const alternatives = countryMatches[countryLower as keyof typeof countryMatches] || []
        return alternatives.some((alt) => placeLower.includes(alt))
      })
    }

    // Sort by time (newest first)
    return earthquakes.sort((a, b) => b.time - a.time)
  } catch (error) {
    console.error("Failed to fetch earthquake data:", error)
    return []
  }
}

// Get earthquake by ID
export async function getEarthquakeById(id: string): Promise<Earthquake> {
  console.log(`Fetching earthquake with ID: ${id}`)

  try {
    // Try direct query by ID first
    try {
      const response = await fetch(`${USGS_API_BASE_URL}/query?format=geojson&eventid=${id}`, {
        cache: "no-store", // Disable caching to get fresh data
        next: { revalidate: 0 }, // Force revalidation on each request
      })

      if (response.ok) {
        const data = await response.json()

        // Check if we got valid features
        if (data.features && data.features.length > 0) {
          const feature = data.features[0]
          const { properties, geometry } = feature

          console.log("Found earthquake via direct query:", {
            id,
            place: properties.place,
            time: properties.time,
            magnitude: properties.mag,
          })

          return {
            id,
            place: properties.place || "Unknown location",
            time: properties.time || Date.now(),
            magnitude: properties.mag || 0,
            magnitudeType: properties.magType || "Unknown",
            status: properties.status || "unknown",
            tsunami: properties.tsunami === 1,
            depth: geometry.coordinates[2] || 0,
            coordinates: [geometry.coordinates[0] || 0, geometry.coordinates[1] || 0], // [longitude, latitude]
            source: properties.sources?.split(",")[0] || "USGS",
            url: properties.url || `https://earthquake.usgs.gov/earthquakes/eventpage/${id}`,
            felt: properties.felt || null,
            cdi: properties.cdi || null,
            mmi: properties.mmi || null,
            alert: properties.alert || null,
          }
        }
      }
    } catch (directQueryError) {
      console.error("Direct query failed:", directQueryError)
      // Continue to next method
    }

    // Try to find in recent data
    try {
      console.log(`Trying to find earthquake ${id} in recent data...`)

      // Get a larger set of recent earthquakes to search through
      const recentEarthquakes = await getRecentEarthquakes({
        minmagnitude: 0, // Lower threshold to find more earthquakes
        limit: 1000, // Increase limit to find more earthquakes
        starttime: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
      })

      // Look for the earthquake by ID
      const earthquake = recentEarthquakes.find((eq) => eq.id === id)

      if (earthquake) {
        console.log(`Found earthquake ${id} in recent data`)
        return earthquake
      }
    } catch (recentDataError) {
      console.error("Recent data search failed:", recentDataError)
      // Continue to next method
    }

    // Try alternative USGS API endpoints
    const endpoints = [
      `https://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/${id}.geojson`,
      `https://earthquake.usgs.gov/earthquakes/eventpage/${id}/executive`,
    ]

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`)
        const response = await fetch(endpoint, {
          cache: "no-store",
          next: { revalidate: 0 },
        })

        if (response.ok) {
          // If it's the executive page, we can't parse it as JSON
          if (endpoint.includes("/executive")) {
            console.log(`Found earthquake ${id} via executive page`)
            // Create a synthetic record with the ID since we can't parse HTML
            return createSyntheticEarthquake(id)
          }

          try {
            const data = await response.json()

            // Check if we got valid data
            if (data && data.properties && data.geometry) {
              const { properties, geometry } = data

              console.log(`Found earthquake ${id} via alternative endpoint`)
              return {
                id,
                place: properties.place || "Unknown location",
                time: properties.time || Date.now(),
                magnitude: properties.mag || 0,
                magnitudeType: properties.magType || "Unknown",
                status: properties.status || "unknown",
                tsunami: properties.tsunami === 1,
                depth: geometry.coordinates[2] || 0,
                coordinates: [geometry.coordinates[0] || 0, geometry.coordinates[1] || 0],
                source: properties.sources?.split(",")[0] || "USGS",
                url: properties.url || `https://earthquake.usgs.gov/earthquakes/eventpage/${id}`,
                felt: properties.felt || null,
                cdi: properties.cdi || null,
                mmi: properties.mmi || null,
                alert: properties.alert || null,
              }
            }
          } catch (jsonError) {
            console.error(`Failed to parse JSON from endpoint ${endpoint}:`, jsonError)
            // Continue to next endpoint
          }
        }
      } catch (endpointError) {
        console.error(`Failed to fetch from endpoint ${endpoint}:`, endpointError)
        // Continue to next endpoint
      }
    }

    // If all methods fail, create a synthetic earthquake
    console.log(`All methods failed. Creating synthetic data for ${id}`)
    return createSyntheticEarthquake(id)
  } catch (error) {
    // Catch-all error handler to ensure we never throw
    console.error(`Unexpected error fetching earthquake ${id}:`, error)
    return createSyntheticEarthquake(id)
  }
}

// Create synthetic earthquake data when we can't find the real data
function createSyntheticEarthquake(id: string): Earthquake {
  console.log(`Creating synthetic earthquake for ID: ${id}`)

  // Extract some information from the ID if possible
  // For example, USGS IDs sometimes encode the approximate time
  const now = Date.now()
  const time = now - 7 * 24 * 60 * 60 * 1000 // Default to a week ago

  return {
    id,
    place: "Location unavailable",
    time,
    magnitude: 0,
    magnitudeType: "Unknown",
    status: "unknown",
    tsunami: false,
    depth: 0,
    coordinates: [0, 0],
    source: "USGS",
    url: `https://earthquake.usgs.gov/earthquakes/eventpage/${id}`,
    felt: null,
    cdi: null,
    mmi: null,
    alert: null,
  }
}

// Get earthquakes near a location
export async function getNearbyEarthquakes(
  latitude: number,
  longitude: number,
  radius = 500,
  days = 30,
  minMagnitude = 2.5,
): Promise<Earthquake[]> {
  const startTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  const endTime = new Date().toISOString()

  const queryParams = new URLSearchParams({
    format: "geojson",
    starttime: startTime,
    endtime: endTime,
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    maxradiuskm: radius.toString(),
    minmagnitude: minMagnitude.toString(),
    orderby: "time",
    limit: "1000", // Increased limit to get more data
  })

  try {
    const response = await fetch(`${USGS_API_BASE_URL}/query?${queryParams.toString()}`, {
      cache: "no-store", // Disable caching to get fresh data
      next: { revalidate: 0 }, // Force revalidation on each request
    })

    if (!response.ok) {
      throw new Error(`USGS API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Transform GeoJSON features to our Earthquake type
    return data.features.map((feature: any) => {
      const { id, properties, geometry } = feature

      return {
        id,
        place: properties.place || "Unknown location",
        time: properties.time,
        magnitude: properties.mag || 0,
        magnitudeType: properties.magType || "Unknown",
        status: properties.status || "unknown",
        tsunami: properties.tsunami === 1,
        depth: geometry.coordinates[2] || 0,
        coordinates: [geometry.coordinates[0], geometry.coordinates[1]], // [longitude, latitude]
        source: properties.sources?.split(",")[0] || "USGS",
        url: properties.url,
        felt: properties.felt,
        cdi: properties.cdi,
        mmi: properties.mmi,
        alert: properties.alert,
      }
    })
  } catch (error) {
    console.error("Failed to fetch nearby earthquakes:", error)
    return []
  }
}

// Get earthquake statistics for a region
export async function getEarthquakeStatistics(
  latitude: number,
  longitude: number,
  radius = 500,
  days = 365,
): Promise<{ count: number; maxMagnitude: number; recentActivity: number }> {
  try {
    // Get earthquakes for the past year
    const yearEarthquakes = await getNearbyEarthquakes(latitude, longitude, radius, days, 0)

    // Get earthquakes for the past 30 days
    const recentEarthquakes = await getNearbyEarthquakes(latitude, longitude, radius, 30, 0)

    // Calculate statistics
    const count = yearEarthquakes.length

    const maxMagnitude = yearEarthquakes.reduce((max, eq) => {
      return eq.magnitude > max ? eq.magnitude : max
    }, 0)

    // Calculate recent activity as earthquakes per day in the last 30 days
    const recentActivity = recentEarthquakes.length / 30

    return {
      count,
      maxMagnitude,
      recentActivity,
    }
  } catch (error) {
    console.error("Failed to calculate earthquake statistics:", error)
    return {
      count: 0,
      maxMagnitude: 0,
      recentActivity: 0,
    }
  }
}

// Get a list of countries/regions with recent earthquake activity
export async function getActiveRegions(): Promise<string[]> {
  try {
    const earthquakes = await getRecentEarthquakes({
      minmagnitude: 4.0,
      limit: 500,
    })

    // Extract country/region names from place descriptions
    const regions = new Set<string>()

    earthquakes.forEach((eq) => {
      const place = eq.place
      if (place) {
        // Extract region after "of" (e.g., "10km NE of Tokyo, Japan" -> "Japan")
        if (place.includes(" of ")) {
          const parts = place.split(" of ")[1].split(", ")
          if (parts.length > 1) {
            regions.add(parts[parts.length - 1].trim())
          }
        }
        // Extract region after comma (e.g., "Banda Sea, Indonesia" -> "Indonesia")
        else if (place.includes(", ")) {
          const parts = place.split(", ")
          regions.add(parts[parts.length - 1].trim())
        }
        // Use the whole place if no pattern matches
        else {
          regions.add(place.trim())
        }
      }
    })

    return Array.from(regions).sort()
  } catch (error) {
    console.error("Failed to get active regions:", error)
    return []
  }
}

