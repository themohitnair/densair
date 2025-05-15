import React, { Suspense } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { LoadingAnimation } from "@/components/loading-animation"
import SummarizePageClient from "./summarize-page-client"

export const dynamic = "force-dynamic"

export default function SummarizePage() {
  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Suspense fallback={<LoadingFallback />}>
          <SummarizePageClient />
        </Suspense>
      </div>
    </TooltipProvider>
  )
}

function LoadingFallback() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12">
      <LoadingAnimation />
      <p className="mt-4 text-muted-foreground">Loading page…</p>
    </div>
  )
}
