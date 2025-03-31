import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import ThailandEarthquakeFeed from "@/components/thailand-earthquake-feed"
import ThailandEarthquakeMap from "@/components/thailand-earthquake-map"

export default function ThailandEarthquakeSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Thailand Earthquake Monitoring</h2>
        <p className="text-muted-foreground">
          ข้อมูลแผ่นดินไหวจากกรมอุตุนิยมวิทยา ประเทศไทย
          <br />
          Earthquake data from Thai Meteorological Department
        </p>
      </div>

      <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900">
        <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-800 dark:text-amber-300">
          ข้อมูลนี้เป็นลิขสิทธิ์ของกรมอุตุนิยมวิทยา ภายใต้พระราชบัญญัติลิขสิทธิ์ พ.ศ. 2537
          <br />
          This data is the copyright of the Thai Meteorological Department under the Copyright Act 1994.
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

      <div className="text-xs text-muted-foreground space-y-2 border-t pt-4">
        <p>
          <strong>ข้อตกลงการใช้ข้อมูล / Terms of Use:</strong>
        </p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            ข้อมูลอุตุนิยมวิทยาเป็นทรัพย์สินของกรมอุตุนิยมวิทยาแต่เพียงผู้เดียว ได้รับความคุ้มครองตามพระราชบัญญัติลิขสิทธิ์ พ.ศ. 2537
            หากมีการเผยแพร่ข้อมูลอุตุนิยมวิทยานี้ทั้งหมดหรือบางส่วนสู่สาธารณะในลักษณะที่ไม่ใช่การแสวงหากำไรในทางการค้า
            ผู้เผยแพร่จะต้องระบุแหล่งที่มาของข้อมูล (กรมอุตุนิยมวิทยา) ประกอบข้อมูลหรือเนื้อหาทุกครั้ง
          </li>
          <li>
            กรมอุตุนิยมวิทยาห้ามมิให้ผู้ใดทำซ้ำ ดัดแปลง ทำสำเนา เผยแพร่สู่สาธารณะ จำหน่าย ให้เช่า หรือกระทำการใดๆ
            อันเป็นการแสวงหาประโยชน์ในทางการค้าหรือประโยชน์อันมิชอบจากข้อมูลอุตุนิยมวิทยาโดยไม่ได้รับอนุญาตจากกรมอุตุนิยมวิทยา หากพบเห็น
            กรมอุตุนิยมวิทยาจะดำเนินการทางกฎหมายกับผู้ละเมิดลิขสิทธิ์ดังกล่าวทันที
          </li>
        </ol>
        <p className="mt-2">
          <strong>Copyright © {new Date().getFullYear()} Thai Meteorological Department</strong>
        </p>
      </div>
    </div>
  )
}

