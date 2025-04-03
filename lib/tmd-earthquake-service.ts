import type {
  TMDEarthquake,
  TMDEarthquakeResponse,
} from "@/types/tmd-earthquake";
import { parseISO, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";

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

// Filter earthquakes based on criteria
export function filterTMDEarthquakes(
  earthquakes: TMDEarthquake[],
  filters: {
    startDate?: Date;
    endDate?: Date;
    country?: string;
  }
): TMDEarthquake[] {
  return earthquakes.filter((eq) => {
    // Parse the date
    let eqDate: Date;
    try {
      eqDate = parseISO(eq.DateTimeThai.replace(".000", ""));
    } catch (e) {
      // If date parsing fails, use current date as fallback
      console.error("Date parsing failed for:", eq.DateTimeThai);
      return false; // Skip this earthquake if date parsing fails
    }

    // Filter by date range - use startOfDay and endOfDay to include the entire day
    if (filters.startDate) {
      const startOfFilterDay = startOfDay(filters.startDate);
      if (isBefore(eqDate, startOfFilterDay)) {
        return false;
      }
    }

    if (filters.endDate) {
      const endOfFilterDay = endOfDay(filters.endDate);
      if (isAfter(eqDate, endOfFilterDay)) {
        return false;
      }
    }

    // Filter by country
    if (filters.country) {
      const originLower = eq.OriginThai.toLowerCase();
      const titleLower = eq.TitleThai.toLowerCase();

      // Check for country name in Thai and English
      const countryLower = filters.country.toLowerCase();

      // Map of English country names to Thai equivalents or keywords
      const countryMappings: Record<string, string[]> = {
        thailand: ["ไทย", "ประเทศไทย"],
        myanmar: ["พม่า", "เมียนมา", "เมียนมาร์"],
        laos: ["ลาว"],
        cambodia: ["กัมพูชา"],
        vietnam: ["เวียดนาม"],
        malaysia: ["มาเลเซีย"],
        indonesia: ["อินโดนีเซีย"],
        philippines: ["ฟิลิปปินส์"],
        china: ["จีน"],
        india: ["อินเดีย"],
        bangladesh: ["บังกลาเทศ"],
        nepal: ["เนปาล"],
        bhutan: ["ภูฏาน"],
        taiwan: ["ไต้หวัน"],
        japan: ["ญี่ปุ่น"],
        "south korea": ["เกาหลีใต้"],
        "north korea": ["เกาหลีเหนือ"],
        singapore: ["สิงคโปร์"],
        brunei: ["บรูไน"],
        "east timor": ["ติมอร์ตะวันออก"],
        "papua new guinea": ["ปาปัวนิวกินี"],
        australia: ["ออสเตรเลีย"],
      };

      // Check if the country name (in English) or its Thai equivalent is in the origin or title
      const thaiKeywords = countryMappings[countryLower] || [];

      const matchesEnglish =
        originLower.includes(countryLower) || titleLower.includes(countryLower);
      const matchesThai = thaiKeywords.some(
        (keyword) =>
          originLower.includes(keyword) || titleLower.includes(keyword)
      );

      if (!matchesEnglish && !matchesThai) {
        return false;
      }
    }

    return true;
  });
}
