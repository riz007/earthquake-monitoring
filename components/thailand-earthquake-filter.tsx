"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Check, ChevronDown, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// List of countries in the region
const COUNTRIES = [
  "Thailand",
  "Myanmar",
  "Laos",
  "Cambodia",
  "Vietnam",
  "Malaysia",
  "Indonesia",
  "Philippines",
  "China",
  "India",
  "Bangladesh",
  "Nepal",
  "Bhutan",
  "Taiwan",
  "Japan",
  "South Korea",
  "North Korea",
  "Singapore",
  "Brunei",
  "East Timor",
  "Papua New Guinea",
  "Australia",
];

interface ThailandEarthquakeFilterProps {
  onFilterChange: (filters: {
    startDate: Date | undefined;
    endDate: Date | undefined;
    country: string | undefined;
  }) => void;
}

export default function ThailandEarthquakeFilter({
  onFilterChange,
}: ThailandEarthquakeFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>(
    undefined
  );

  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);

  const applyFilters = () => {
    onFilterChange({
      startDate,
      endDate,
      country: selectedCountry,
    });
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedCountry(undefined);
    onFilterChange({
      startDate: undefined,
      endDate: undefined,
      country: undefined,
    });
    setIsFilterOpen(false);
  };

  return (
    <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <h3 className="font-medium">Filter Earthquakes</h3>

          <div className="space-y-2">
            <Label>Country/Region</Label>
            <Popover open={countryOpen} onOpenChange={setCountryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={countryOpen}
                  className="w-full justify-between">
                  {selectedCountry || "All countries"}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search country..." />
                  <CommandList>
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      <CommandItem
                        onSelect={() => {
                          setSelectedCountry(undefined);
                          setCountryOpen(false);
                        }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            !selectedCountry ? "opacity-100" : "opacity-0"
                          )}
                        />
                        All countries
                      </CommandItem>
                      {COUNTRIES.map((country) => (
                        <CommandItem
                          key={country}
                          onSelect={() => {
                            setSelectedCountry(country);
                            setCountryOpen(false);
                          }}>
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCountry === country
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {country}
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
                    date > new Date() || (endDate ? date > endDate : false)
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
                    date > new Date() || (startDate ? date < startDate : false)
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset
            </Button>
            <Button size="sm" onClick={applyFilters}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
