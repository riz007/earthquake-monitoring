export interface TMDEarthquake {
  OriginThai: string
  DateTimeUTC: string
  DateTimeThai: string
  Depth: number
  Magnitude: number
  Latitude: number
  Longitude: number
  TitleThai: string
}

export interface TMDEarthquakeResponse {
  metadata: {
    title: string
    description: string
    lastBuildDate: string
    copyright: string
    status: string
  }
  earthquakes: TMDEarthquake[]
}

