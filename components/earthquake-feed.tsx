"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow, format, startOfDay, endOfDay } from "date-fns";
import { getRecentEarthquakes } from "@/lib/earthquake-service";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  AlertTriangle,
  CalendarIcon,
  Filter,
  ChevronDown,
  Check,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { Earthquake } from "@/types/earthquake";

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
];

// Country name variations for better matching
const countryVariations: Record<string, string[]> = {
  "United States": ["USA", "US", "United States of America", "America"],
  "United Kingdom": [
    "UK",
    "Great Britain",
    "England",
    "Scotland",
    "Wales",
    "Northern Ireland",
    "Britain",
  ],
  Russia: ["Russian Federation"],
  Myanmar: ["Burma"],
  "North Korea": ["Democratic People's Republic of Korea", "DPRK"],
  "South Korea": ["Republic of Korea", "Korea"],
  China: ["People's Republic of China", "PRC"],
  Iran: ["Islamic Republic of Iran"],
  Syria: ["Syrian Arab Republic"],
  Vietnam: ["Viet Nam"],
  Laos: ["Lao People's Democratic Republic", "Lao PDR"],
  Venezuela: ["Bolivarian Republic of Venezuela"],
  Bolivia: ["Plurinational State of Bolivia"],
  Tanzania: ["United Republic of Tanzania"],
  Taiwan: ["Chinese Taipei", "Republic of China", "ROC"],
};

export default function EarthquakeFeed() {
  const [allEarthquakes, setAllEarthquakes] = useState<Earthquake[]>([]);
  const [filteredEarthquakes, setFilteredEarthquakes] = useState<Earthquake[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [minMagnitude, setMinMagnitude] = useState(0);
  const [maxResults, setMaxResults] = useState(100);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Date picker states
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  // Country combobox state
  const [countryOpen, setCountryOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const resultsPerPage = 10;
  const [paginatedEarthquakes, setPaginatedEarthquakes] = useState<
    Earthquake[]
  >([]);

  // Load saved filters from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFilters = localStorage.getItem("earthquakeFilters");
      if (savedFilters) {
        const filters = JSON.parse(savedFilters);
        if (filters.startDate) setStartDate(new Date(filters.startDate));
        if (filters.endDate) setEndDate(new Date(filters.endDate));
        if (filters.minMagnitude !== undefined)
          setMinMagnitude(filters.minMagnitude);
        if (filters.maxResults) setMaxResults(filters.maxResults);
        if (filters.selectedRegion) setSelectedRegion(filters.selectedRegion);
      }
    }
  }, []);

  // Save filters to localStorage when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const filtersToSave = {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        minMagnitude,
        maxResults,
        selectedRegion,
      };
      localStorage.setItem("earthquakeFilters", JSON.stringify(filtersToSave));
    }
  }, [startDate, endDate, minMagnitude, maxResults, selectedRegion]);

  // Fetch earthquakes
  const fetchEarthquakes = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all earthquakes with minimal filtering
      const data = await getRecentEarthquakes({
        minmagnitude: 0,
        limit: 1000,
      });
      setAllEarthquakes(data);

      // Apply client-side filtering
      applyFilters(data);
    } catch (err) {
      console.error("Failed to fetch earthquake data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch earthquake data"
      );
      setAllEarthquakes([]); // Set empty array on error
      setFilteredEarthquakes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchEarthquakes();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    applyFilters(allEarthquakes);
  }, [
    allEarthquakes,
    startDate,
    endDate,
    minMagnitude,
    maxResults,
    selectedRegion,
  ]);

  // Check if a place contains a country name
  const placeContainsCountry = (place: string, country: string): boolean => {
    const placeLower = place.toLowerCase();
    const countryLower = country.toLowerCase();

    // Direct match
    if (placeLower.includes(countryLower)) {
      return true;
    }

    // Check variations
    const variations = countryVariations[country] || [];
    return variations.some((variation) =>
      placeLower.includes(variation.toLowerCase())
    );
  };

  // Apply filters to the earthquake data
  const applyFilters = (earthquakes: Earthquake[]) => {
    let filtered = [...earthquakes];

    // Filter by magnitude
    if (minMagnitude > 0) {
      filtered = filtered.filter((eq) => eq.magnitude >= minMagnitude);
    }

    // Filter by date range
    if (startDate) {
      const startOfFilterDay = startOfDay(startDate);
      filtered = filtered.filter((eq) => {
        const eqDate = new Date(eq.time);
        return eqDate >= startOfFilterDay;
      });
    }

    if (endDate) {
      const endOfFilterDay = endOfDay(endDate);
      filtered = filtered.filter((eq) => {
        const eqDate = new Date(eq.time);
        return eqDate <= endOfFilterDay;
      });
    }

    // Filter by region/country
    if (selectedRegion) {
      filtered = filtered.filter((eq) =>
        placeContainsCountry(eq.place, selectedRegion)
      );
    }

    // Limit results
    filtered = filtered.slice(0, maxResults);

    // Sort by time (newest first)
    filtered.sort((a, b) => b.time - a.time);

    setFilteredEarthquakes(filtered);
    setTotalPages(Math.ceil(filtered.length / resultsPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Update paginated earthquakes when page changes or earthquakes change
  useEffect(() => {
    const start = (currentPage - 1) * resultsPerPage;
    const end = start + resultsPerPage;
    setPaginatedEarthquakes(filteredEarthquakes.slice(start, end));
  }, [filteredEarthquakes, currentPage]);

  const getMagnitudeColor = (magnitude: number) => {
    if (magnitude < 4.0) return "bg-emerald-500 text-white";
    if (magnitude < 5.0) return "bg-amber-500 text-black";
    if (magnitude < 6.0) return "bg-orange-500 text-white";
    return "bg-red-600 text-white";
  };

  const getAlertBadge = (alert: string | null) => {
    if (!alert) return null;

    const alertColors: Record<string, string> = {
      green:
        "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
      yellow:
        "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
      orange:
        "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
      red: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
    };

    return (
      <Badge
        variant="outline"
        className={`ml-auto ${alertColors[alert] || ""}`}>
        <AlertTriangle className="mr-1 h-3 w-3" />
        {alert.toUpperCase()} Alert
      </Badge>
    );
  };

  const resetFilters = () => {
    setStartDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    setEndDate(new Date());
    setMinMagnitude(0);
    setMaxResults(100);
    setSelectedRegion("");
    setIsFilterOpen(false);
    setStartDateOpen(false);
    setEndDateOpen(false);
    setCountryOpen(false);

    // Clear saved filters
    if (typeof window !== "undefined") {
      localStorage.removeItem("earthquakeFilters");
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEarthquakes();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">Recent Earthquakes</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredEarthquakes.length} events
            {startDate && endDate ? ` in the selected date range` : ""}
            {selectedRegion ? ` in ${selectedRegion}` : ""}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || refreshing}>
            {refreshing ? (
              <Loader className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>

          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end" sideOffset={5}>
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
                        className="w-full justify-between">
                        {selectedRegion ? selectedRegion : "All regions"}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Search country..."
                          className="h-9"
                        />
                        <CommandList>
                          <CommandEmpty>No country found.</CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-auto">
                            <CommandItem
                              onSelect={() => {
                                setSelectedRegion("");
                                setCountryOpen(false);
                              }}
                              className="cursor-pointer">
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  !selectedRegion ? "opacity-100" : "opacity-0"
                                )}
                              />
                              All regions
                            </CommandItem>
                            {countries.map((region) => (
                              <CommandItem
                                key={region}
                                onSelect={() => {
                                  setSelectedRegion(region);
                                  setCountryOpen(false);
                                }}
                                className="cursor-pointer">
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedRegion === region
                                      ? "opacity-100"
                                      : "opacity-0"
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
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                          setStartDate(date);
                          setStartDateOpen(false);
                        }}
                        disabled={(date) =>
                          date > new Date() ||
                          (endDate ? date > endDate : false)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => {
                          setEndDate(date);
                          setEndDateOpen(false);
                        }}
                        disabled={(date) =>
                          date > new Date() ||
                          (startDate ? date < startDate : false)
                        }
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setMaxResults(Math.max(10, maxResults - 10))
                      }>
                      -
                    </Button>
                    <div className="flex-1 text-center">{maxResults}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setMaxResults(Math.min(1000, maxResults + 10))
                      }>
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
          <p className="mt-2 text-sm">
            Please try adjusting your filters or try again later.
          </p>
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
      ) : filteredEarthquakes.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No earthquake data matching your filter criteria
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
                    <Badge
                      className={`text-lg py-1 px-3 ${getMagnitudeColor(
                        earthquake.magnitude
                      )}`}>
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
                disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>

              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
