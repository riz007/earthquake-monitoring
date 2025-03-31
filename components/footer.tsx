import Link from "next/link";
import { Activity, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t py-8 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Activity className="h-6 w-6 text-red-500" />
              <span className="font-bold text-lg">EarthquakeMonitor</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              Real-time earthquake detection and monitoring for Thailand and
              worldwide. This application uses data from the USGS Earthquake
              Hazards Program and Thai Meteorological Department.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Official Sources</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://earthquake.usgs.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center">
                  <ExternalLink className="h-3 w-3 mr-2" />
                  USGS Earthquake Hazards Program
                </a>
              </li>
              <li>
                <a
                  href="https://www.tsunami.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center">
                  <ExternalLink className="h-3 w-3 mr-2" />
                  U.S. Tsunami Warning System
                </a>
              </li>
              <li>
                <a
                  href="https://earthquake.tmd.go.th/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center">
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Thai Meteorological Department
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Safety Resources</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.ready.gov/earthquakes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center">
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Ready.gov Earthquake Preparedness
                </a>
              </li>
              <li>
                <a
                  href="https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/earthquake.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center">
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Red Cross Earthquake Safety
                </a>
              </li>
              <li>
                <a
                  href="https://www.who.int/news-room/fact-sheets/detail/earthquakes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center">
                  <ExternalLink className="h-3 w-3 mr-2" />
                  WHO Earthquake Health Guidelines
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-sm text-muted-foreground">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <p>
              © {new Date().getFullYear()} EarthquakeMonitor. All rights
              reserved.
            </p>
            <p>
              Data source(s):{" "}
              <a
                href="https://earthquake.usgs.gov/fdsnws/event/1/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline">
                USGS Earthquake API
              </a>
              <br />
              <a
                href="https://www.tmd.go.th/en/EarthQuake"
                target="_blank"
                rel="noopener noreferrer"
                className="underline">
                Thai Meteorological Department
              </a>
            </p>
          </div>
          <p className="mt-4 text-xs">
            Disclaimer: This application provides information for educational
            purposes only. The risk assessment is algorithmic and should not be
            used as the sole basis for safety decisions. Always refer to
            official sources and local authorities for critical information
            during seismic events.
          </p>
        </div>
      </div>
    </footer>
  );
}
