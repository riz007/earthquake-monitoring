"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { getTMDEarthquakes } from "@/lib/tmd-earthquake-service";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  Loader,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { TMDEarthquake } from "@/types/tmd-earthquake";

export default function ThailandEarthquakeFeed() {
  const [earthquakes, setEarthquakes] = useState<TMDEarthquake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [paginatedEarthquakes, setPaginatedEarthquakes] = useState<
    TMDEarthquake[]
  >([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchEarthquakes = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTMDEarthquakes();
        setEarthquakes(data);
        setTotalPages(Math.ceil(data.length / itemsPerPage));
      } catch (err) {
        console.error("Failed to fetch TMD earthquake data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch earthquake data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEarthquakes();
  }, []);

  // Update paginated earthquakes when page changes or earthquakes change
  useEffect(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setPaginatedEarthquakes(earthquakes.slice(start, end));
  }, [earthquakes, currentPage]);

  const getMagnitudeColor = (magnitude: number) => {
    if (magnitude < 3.0) return "bg-emerald-500 text-white";
    if (magnitude < 4.0) return "bg-blue-500 text-white";
    if (magnitude < 5.0) return "bg-amber-500 text-black";
    if (magnitude < 6.0) return "bg-orange-500 text-white";
    return "bg-red-600 text-white";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            กำลังโหลดข้อมูลแผ่นดินไหว...
          </p>
          <p className="text-sm text-muted-foreground">
            Loading earthquake data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (earthquakes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          ไม่พบข้อมูลแผ่นดินไหวล่าสุด
          <br />
          No recent earthquake data available
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {paginatedEarthquakes.map((earthquake, index) => {
        // Parse the date strings - handle potential parsing issues
        let dateTimeThai;
        try {
          dateTimeThai = parseISO(earthquake.DateTimeThai.replace(".000", ""));
        } catch (e) {
          dateTimeThai = new Date(); // Fallback to current date if parsing fails
        }

        return (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="bg-muted/30 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {earthquake.TitleThai}
                </CardTitle>
                <Badge className={`${getMagnitudeColor(earthquake.Magnitude)}`}>
                  M{earthquake.Magnitude.toFixed(1)}
                </Badge>
              </div>
              <CardDescription>{earthquake.OriginThai}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{format(dateTimeThai, "PPP")}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{format(dateTimeThai, "p")}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {earthquake.Latitude.toFixed(4)},{" "}
                      {earthquake.Longitude.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>ความลึก/Depth: {earthquake.Depth} km</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Pagination controls */}
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
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900 mt-6">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-800 dark:text-blue-300 text-xs">
          ข้อมูลจากกรมอุตุนิยมวิทยา ประเทศไทย
          <br />
          Data provided by Thai Meteorological Department
        </AlertDescription>
      </Alert>
    </div>
  );
}
