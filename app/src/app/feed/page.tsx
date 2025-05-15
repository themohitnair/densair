import React, { Suspense } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { LoadingAnimation } from "@/components/loading-animation"
import FeedPageClient from "./feed-page-client"

export const dynamic = "force-dynamic"

export default function FeedPage() {
  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1">
          {/* 
            Only the client logic lives inside this Suspense.
            Next.js will prerender everything up to here.
          */}
          <Suspense fallback={<FeedLoadingFallback />}>
            <FeedPageClient />
          </Suspense>
        </main>
      </div>
    </TooltipProvider>
  )
}

function FeedLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <LoadingAnimation />
      <p className="mt-4 text-muted-foreground">Loading your feed…</p>
    </div>
  )
}