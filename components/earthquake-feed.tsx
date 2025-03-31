"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { formatDistanceToNow, format } from "date-fns"
import { getRecentEarthquakes, getActiveRegions } from "@/lib/earthquake-service"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, AlertTriangle, CalendarIcon, Filter, ChevronDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import type { Earthquake } from "@/types/earthquake"
import { useUserLocation } from "@/hooks/use-user-location"

// List of countries for the filter
const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kosovo",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
]

export default function EarthquakeFeed() {
  const { location } = useUserLocation()
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [regions, setRegions] = useState<string[]>([])

  // Filter states
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  )
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  const [minMagnitude, setMinMagnitude] = useState(4.0)
  const [maxResults, setMaxResults] = useState(20)
  const [selectedRegion, setSelectedRegion] = useState<string>("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Date picker states
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)

  // Country com  = useState(false)

  // Country combobox state
  const [countryOpen, setCountryOpen] = useState(false)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const resultsPerPage = 10
  const [paginatedEarthquakes, setPaginatedEarthquakes] = useState<Earthquake[]>([])

  // Load saved filters from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFilters = localStorage.getItem("earthquakeFilters")
      if (savedFilters) {
        const filters = JSON.parse(savedFilters)
        if (filters.startDate) setStartDate(new Date(filters.startDate))
        if (filters.endDate) setEndDate(new Date(filters.endDate))
        if (filters.minMagnitude) setMinMagnitude(filters.minMagnitude)
        if (filters.maxResults) setMaxResults(filters.maxResults)
        if (filters.selectedRegion) setSelectedRegion(filters.selectedRegion)
      }
    }
  }, [])

  // Save filters to localStorage when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const filtersToSave = {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        minMagnitude,
        maxResults,
        selectedRegion,
      }
      localStorage.setItem("earthquakeFilters", JSON.stringify(filtersToSave))
    }
  }, [startDate, endDate, minMagnitude, maxResults, selectedRegion])

  // Load active regions
  useEffect(() => {
    const loadRegions = async () => {
      try {
        const activeRegions = await getActiveRegions()
        setRegions([...new Set([...activeRegions, ...countries])].sort())
      } catch (err) {
        console.error("Failed to load active regions:", err)
        setRegions([...countries])
      }
    }

    loadRegions()
  }, [])

  // Fetch earthquakes based on filters
  useEffect(() => {
    const fetchEarthquakes = async () => {
      setLoading(true)
      setError(null)
      try {
        const params: any = {
          minmagnitude: minMagnitude,
          limit: maxResults,
        }

        if (startDate) {
          params.starttime = startDate.toISOString()
        }

        if (endDate) {
          params.endtime = endDate.toISOString()
        }

        if (selectedRegion && selectedRegion !== "all") {
          params.country = selectedRegion
        }

        const data = await getRecentEarthquakes(params)
        setEarthquakes(data)

        // Calculate total pages
        setTotalPages(Math.ceil(data.length / resultsPerPage))
        setCurrentPage(1) // Reset to first page when filters change
      } catch (err) {
        console.error("Failed to fetch earthquake data:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch earthquake data")
        setEarthquakes([]) // Set empty array on error
      } finally {
        setLoading(false)
      }
    }

    fetchEarthquakes()
  }, [startDate, endDate, minMagnitude, maxResults, selectedRegion])

  // Update paginated earthquakes when page changes or earthquakes change
  useEffect(() => {
    const start = (currentPage - 1) * resultsPerPage
    const end = start + resultsPerPage
    setPaginatedEarthquakes(earthquakes.slice(start, end))
  }, [earthquakes, currentPage])

  const getMagnitudeColor = (magnitude: number) => {
    if (magnitude < 4.0) return "bg-emerald-500 text-white"
    if (magnitude < 5.0) return "bg-amber-500 text-black"
    if (magnitude < 6.0) return "bg-orange-500 text-white"
    return "bg-red-600 text-white"
  }

  const getAlertBadge = (alert: string | null) => {
    if (!alert) return null

    const alertColors: Record<string, string> = {
      green:
        "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
      yellow:
        "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
      orange:
        "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
      red: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
    }

    return (
      <Badge variant="outline" className={`ml-auto ${alertColors[alert] || ""}`}>
        <AlertTriangle className="mr-1 h-3 w-3" />
        {alert.toUpperCase()} Alert
      </Badge>
    )
  }

  const resetFilters = () => {
    setStartDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    setEndDate(new Date())
    setMinMagnitude(4.0)
    setMaxResults(20)
    setSelectedRegion("")
    setIsFilterOpen(false)
    setStartDateOpen(false)
    setEndDateOpen(false)
    setCountryOpen(false)

    // Clear saved filters
    if (typeof window !== "undefined") {
      localStorage.removeItem("earthquakeFilters")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">Recent Earthquakes</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {earthquakes.length} events in the last{" "}
            {startDate && endDate ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : 30}{" "}
            days
          </span>

          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end" sideOffset={5}>
              <div className="space-y-4">
                <h3 className="font-medium">Filter</h3>

                <div className="space-y-2">
                  <Label>Region/Country</Label>
                  <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={countryOpen}
                        className="w-full justify-between"
                      >
                        {selectedRegion ? selectedRegion : "All regions"}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search country..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>No country found.</CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-auto">
                            <CommandItem
                              onSelect={() => {
                                setSelectedRegion("")
                                setCountryOpen(false)
                              }}
                              className="cursor-pointer"
                            >
                              <Check className={cn("mr-2 h-4 w-4", !selectedRegion ? "opacity-100" : "opacity-0")} />
                              All regions
                            </CommandItem>
                            {regions.map((region) => (
                              <CommandItem
                                key={region}
                                onSelect={() => {
                                  setSelectedRegion(region)
                                  setCountryOpen(false)
                                }}
                                className="cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedRegion === region ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {region}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                          setStartDate(date)
                          setStartDateOpen(false)
                        }}
                        disabled={(date) => date > new Date() || (endDate ? date > endDate : false)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => {
                          setEndDate(date)
                          setEndDateOpen(false)
                        }}
                        disabled={(date) => date > new Date() || (startDate ? date < startDate : false)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Min Magnitude</Label>
                    <span className="text-sm">{minMagnitude.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[minMagnitude]}
                    min={0}
                    max={10}
                    step={0.1}
                    onValueChange={(value) => setMinMagnitude(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max Results</Label>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setMaxResults(Math.max(10, maxResults - 10))}>
                      -
                    </Button>
                    <div className="flex-1 text-center">{maxResults}</div>
                    <Button variant="outline" size="sm" onClick={() => setMaxResults(Math.min(1000, maxResults + 10))}>
                      +
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Reset
                  </Button>
                  <Button size="sm" onClick={() => setIsFilterOpen(false)}>
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-4 border border-red-200 rounded-md bg-red-50 dark:bg-red-900/20 dark:border-red-900 text-red-800 dark:text-red-300">
          <p className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            {error}
          </p>
          <p className="mt-2 text-sm">Please try adjusting your filters or try again later.</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-16 bg-muted rounded-md"></div>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : earthquakes.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No recent earthquake data available
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Regular earthquake cards */}
          {paginatedEarthquakes.map((earthquake) => (
            <Link href={`/earthquake/${earthquake.id}`} key={earthquake.id}>
              <Card className="hover:bg-muted/50 transition-colors mb-2">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Badge className={`text-lg py-1 px-3 ${getMagnitudeColor(earthquake.magnitude)}`}>
                      M{earthquake.magnitude.toFixed(1)}
                    </Badge>

                    <div className="flex-1">
                      <h3 className="font-medium">{earthquake.place}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-3 w-3" />
                          {earthquake.depth.toFixed(1)} km depth
                        </div>
                        <div className="flex items-center">
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {format(new Date(earthquake.time), "PPP")}
                        </div>
                        <div>
                          {formatDistanceToNow(new Date(earthquake.time), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    </div>

                    {earthquake.tsunami && (
                      <Badge variant="destructive" className="ml-auto mr-2">
                        Tsunami Risk
                      </Badge>
                    )}

                    {getAlertBadge(earthquake.alert)}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

