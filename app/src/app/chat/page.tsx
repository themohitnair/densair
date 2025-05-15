// This is a Server Component by default (no "use client" at the top)
import React, { Suspense } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { LoadingSpinner } from "@/components/loading-spinner"
import ChatPageClient from './chat-page-client';

export const dynamic = "force-dynamic"

export default function ChatPage() {
  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-background">
        {/* Only this subtree is client‐side - wrapped in Suspense */}
        <Suspense fallback={<LoadingFallback />}>
          <ChatPageClient />
        </Suspense>
      </div>
    </TooltipProvider>
  )
}

function LoadingFallback() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <LoadingSpinner />
      <p className="mt-4 text-muted-foreground">Loading chat…</p>
    </div>
  )
}