import type {
  TMDEarthquake,
  TMDEarthquakeResponse,
} from "@/types/tmd-earthquake";

// Fetch Seismic activities data from Thai Meteorological Department
export async function getTMDEarthquakes(): Promise<TMDEarthquake[]> {
  try {
    const response = await fetch("/api/tmd-earthquakes", {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data: TMDEarthquakeResponse = await response.json();

    const earthquakes = data.earthquakes.map((eq) => {
      let depth = 0;
      if (
        typeof eq.Depth === "object" &&
        eq.Depth !== null &&
        "_" in eq.Depth
      ) {
        depth = Number.parseFloat(eq.Depth._) || 0;
      }

      return {
        ...eq,
        Depth: depth,
        Magnitude: Number.parseFloat(eq.Magnitude) || 0,
        Latitude: Number.parseFloat(eq.Latitude) || 0,
        Longitude: Number.parseFloat(eq.Longitude) || 0,
      };
    });

    const uniqueEarthquakes = earthquakes.filter(
      (eq, index, self) =>
        index ===
        self.findIndex(
          (e) =>
            e.DateTimeThai === eq.DateTimeThai &&
            e.Latitude === eq.Latitude &&
            e.Longitude === eq.Longitude
        )
    );

    return uniqueEarthquakes;
  } catch (error) {
    console.error("Failed to fetch TMD earthquake data:", error);
    return [];
  }
}
