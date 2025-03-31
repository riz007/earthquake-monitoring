import { NextResponse } from "next/server";
import xml2js from "xml2js";

export async function GET() {
  const tmdApiUrl =
    "https://data.tmd.go.th/api/DailySeismicEvent/v1/?uid=api&ukey=api12345";

  try {
    const response = await fetch(tmdApiUrl, {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(
        `TMD API error: ${response.status} ${response.statusText}`
      );
    }

    const xmlData = await response.text();

    const parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
      explicitRoot: true,
      normalizeTags: false,
    });

    const result = await new Promise((resolve, reject) => {
      parser.parseString(xmlData, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    // Handle the case where DailyEarthquakes might be a single object or an array
    let earthquakes = [];
    if (result.DailySeismicEvents.DailyEarthquakes) {
      if (Array.isArray(result.DailySeismicEvents.DailyEarthquakes)) {
        earthquakes = result.DailySeismicEvents.DailyEarthquakes;
      } else {
        earthquakes = [result.DailySeismicEvents.DailyEarthquakes];
      }
    }

    // Format the data for easier consumption
    const formattedData = {
      metadata: {
        title: result.DailySeismicEvents.header.title,
        description: result.DailySeismicEvents.header.description,
        lastBuildDate: result.DailySeismicEvents.header.lastBuildDate,
        copyright: result.DailySeismicEvents.header.copyRight,
        status: result.DailySeismicEvents.header.status,
      },
      earthquakes: earthquakes,
    };

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching or processing TMD data:", error);
    return NextResponse.json(
      { error: "Failed to fetch or process TMD earthquake data" },
      { status: 500 }
    );
  }
}
