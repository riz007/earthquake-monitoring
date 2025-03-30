"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertOctagon } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Unhandled error:", error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
      <AlertOctagon className="h-16 w-16 text-red-500 mb-6" />
      <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
      <p className="text-xl text-muted-foreground mb-8">
        We encountered an error while loading this page. Please try again later.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="default">
          Try again
        </Button>
        <Link href="/">
          <Button variant="outline">Return to Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}

