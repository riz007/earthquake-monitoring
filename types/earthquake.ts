export interface Earthquake {
  id: string
  place: string
  time: number
  magnitude: number
  magnitudeType: string
  status: string
  tsunami: boolean
  depth: number
  coordinates: [number, number] // [longitude, latitude]
  source: string
  url?: string
  felt?: number | null
  cdi?: number | null
  mmi?: number | null
  alert?: string | null
}

