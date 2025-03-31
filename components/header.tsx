"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Activity,
  ExternalLink,
  Menu,
  Info,
  Shield,
  BookOpen,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-b bg-gradient-to-r from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-red-500" />
          <span className="font-bold text-lg">EarthquakeMonitor</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-sm font-medium">
                <Info className="h-4 w-4 mr-2" />
                Resources
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Official Sources</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a
                  href="https://earthquake.usgs.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  USGS Earthquake Hazards
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="https://www.tsunami.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Tsunami Warning Center
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="https://earthquake.tmd.go.th/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Thai Meteorological Department
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-sm font-medium">
                <Shield className="h-4 w-4 mr-2" />
                Safety
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Safety Resources</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a
                  href="https://www.ready.gov/earthquakes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ready.gov Earthquake Preparedness
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/earthquake.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Red Cross Earthquake Safety
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="https://www.who.int/news-room/fact-sheets/detail/earthquakes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  WHO Earthquake Guidelines
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-sm font-medium">
            <Link href="/" className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              About
            </Link>
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex items-center gap-2 mb-8">
                <Activity className="h-6 w-6 text-red-500" />
                <span className="font-bold text-lg">EarthquakeMonitor</span>
              </div>
              <nav className="flex flex-col gap-4">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Resources
                </Link>
                <div className="pl-7 flex flex-col gap-2">
                  <a
                    href="https://earthquake.usgs.gov/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm flex items-center">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    USGS Earthquake Hazards
                  </a>
                  <a
                    href="https://www.tsunami.gov/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm flex items-center">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Tsunami Warning Center
                  </a>
                  <a
                    href="https://earthquake.tmd.go.th/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm flex items-center">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Thai Meteorological Department
                  </a>
                </div>

                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Safety
                </Link>
                <div className="pl-7 flex flex-col gap-2">
                  <a
                    href="https://www.ready.gov/earthquakes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm flex items-center">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ready.gov Earthquake Preparedness
                  </a>
                  <a
                    href="https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/earthquake.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm flex items-center">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Red Cross Earthquake Safety
                  </a>
                  <a
                    href="https://www.who.int/news-room/fact-sheets/detail/earthquakes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm flex items-center">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    WHO Earthquake Guidelines
                  </a>
                </div>

                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  About
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
