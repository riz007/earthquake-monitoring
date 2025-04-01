import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import ThailandEarthquakeFeed from "@/components/thailand-earthquake-feed";
import ThailandEarthquakeMap from "@/components/thailand-earthquake-map";

export default function ThailandEarthquakeSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Thailand & Regional</h2>
        <p className="text-muted-foreground">
          ข้อมูลแผ่นดินไหวจากกรมอุตุนิยมวิทยา ประเทศไทย
          <br />
          Seismic activities data from Thai Meteorological Department
        </p>
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
          <CardTitle>Thailand and Regional Seismic Activity</CardTitle>
          <CardDescription>
            แสดงข้อมูลแผ่นดินไหวในประเทศไทยและภูมิภาคใกล้เคียง
            <br />
            Displaying earthquake data in Thailand and nearby regions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="map" className="mt-2">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="map">แผนที่/Map View</TabsTrigger>
              <TabsTrigger value="list">รายการ/List View</TabsTrigger>
            </TabsList>
            <TabsContent value="map" className="mt-0">
              <div className="h-[500px] rounded-lg overflow-hidden border relative">
                <ThailandEarthquakeMap />
              </div>
            </TabsContent>
            <TabsContent value="list" className="mt-0">
              <ThailandEarthquakeFeed />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
