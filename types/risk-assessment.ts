export interface RiskAssessment {
  overallRisk: number
  faultLineProximity: number
  historicalActivity: number
  buildingVulnerability: number
  populationDensity: number
  historicalSummary: string
  significantEvents: {
    date: string
    magnitude: number
    location: string
    impact: string
  }[]
  recommendations: string[]
  disclaimer: string
}

