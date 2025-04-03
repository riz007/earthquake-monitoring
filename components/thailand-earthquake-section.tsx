"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Info, RefreshCw, Loader } from "lucide-react";
import ThailandEarthquakeFeed from "@/components/thailand-earthquake-feed";
import ThailandEarthquakeMap from "@/components/thailand-earthquake-map";
import ThailandEarthquakeFilter from "@/components/thailand-earthquake-filter";
import {
  getTMDEarthquakes,
  filterTMDEarthquakes,
} from "@/lib/tmd-earthquake-service";
import type { TMDEarthquake } from "@/types/tmd-earthquake";

export default function ThailandEarthquakeSection() {
  const [earthquakes, setEarthquakes] = useState<TMDEarthquake[]>([]);
  const [filteredEarthquakes, setFilteredEarthquakes] = useState<
    TMDEarthquake[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    country: undefined as string | undefined,
  });

  // Fetch earthquakes
  const fetchEarthquakes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTMDEarthquakes();
      setEarthquakes(data);
      setFilteredEarthquakes(data);
    } catch (error) {
      console.error("Failed to fetch TMD earthquake data:", error);
      setError(
        "Failed to fetch earthquake data. Please check your connection and try again."
      );
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
    if (earthquakes.length > 0) {
      const filtered = filterTMDEarthquakes(earthquakes, filters);
      setFilteredEarthquakes(filtered);
    }
  }, [earthquakes, filters]);

  const handleFilterChange = (newFilters: {
    startDate: Date | undefined;
    endDate: Date | undefined;
    country: string | undefined;
  }) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEarthquakes();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Thailand & Regional</h2>
          <p className="text-muted-foreground">
            ข้อมูลแผ่นดินไหวจากกรมอุตุนิยมวิทยา ประเทศไทย
            <br />
            Seismic events data from Thai Meteorological Department
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading || refreshing}
          className="h-9">
          {refreshing ? (
            <Loader className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh Data
        </Button>
      </div>

      <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900">
        <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-800 dark:text-amber-300">
          ข้อมูลนี้เป็นลิขสิทธิ์ของกรมอุตุนิยมวิทยา ภายใต้พระราชบัญญัติลิขสิทธิ์
          พ.ศ. 2537
          <br />
          This data is the copyright of the Thai Meteorological Department under
          the Copyright Act 1994.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Thailand and Regional Seismic Activity</CardTitle>
              <CardDescription>
                แสดงข้อมูลแผ่นดินไหวในประเทศไทยและภูมิภาคใกล้เคียง
                <br />
                Displaying seismic events data in Thailand and nearby regions
              </CardDescription>
            </div>
            <div className="mt-2">
              <ThailandEarthquakeFilter onFilterChange={handleFilterChange} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="text-sm text-muted-foreground">
              {filteredEarthquakes.length} seismic events found
              {filters.country && ` in ${filters.country}`}
              {filters.startDate &&
                ` from ${filters.startDate.toLocaleDateString()}`}
              {filters.endDate && ` to ${filters.endDate.toLocaleDateString()}`}
            </div>
          </div>

          <Tabs defaultValue="map" className="mt-2">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-rose-100 dark:bg-rose-900/20">
              <TabsTrigger
                value="map"
                className="data-[state=active]:bg-rose-200 dark:data-[state=active]:bg-rose-800/30">
                แผนที่/Map View
              </TabsTrigger>
              <TabsTrigger
                value="list"
                className="data-[state=active]:bg-rose-200 dark:data-[state=active]:bg-rose-800/30">
                รายการ/List View
              </TabsTrigger>
            </TabsList>
            <TabsContent value="map" className="mt-0">
              <div className="h-[500px] rounded-lg overflow-hidden border relative">
                <ThailandEarthquakeMap
                  earthquakes={filteredEarthquakes}
                  loading={loading}
                  error={error}
                />
              </div>
            </TabsContent>
            <TabsContent value="list" className="mt-0">
              <ThailandEarthquakeFeed
                earthquakes={filteredEarthquakes}
                loading={loading}
                error={error}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
