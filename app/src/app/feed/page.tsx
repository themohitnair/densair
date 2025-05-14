// app/src/app/feed/page.tsx
"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect, useCallback, useMemo } from "react"
import { toast } from "sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { LoadingAnimation } from "@/components/loading-animation"
import { PaperCard } from "@/components/paper-card"
import { SemanticSearch } from "@/components/semantic-search"
import type { SearchResult } from "@/types/paper-types"
import { useSearchParams } from "next/navigation"
import { convertAbbreviationsToNames } from "@/constants/arxiv"

function joinWithAnd(arr: string[]): string {
  if (arr.length === 0) return ""
  if (arr.length === 1) return arr[0]
  if (arr.length === 2) return arr[0] + " and " + arr[1]
  return arr.slice(0, -1).join(", ") + " and " + arr[arr.length - 1]
}

export default function FeedPage() {
  const searchParams = useSearchParams()

  const urlInterests = useMemo<string[]>(
    () => searchParams.getAll("interests"),
    [searchParams]
  )
  const interestsKey = useMemo<string>(
    () => urlInterests.join(","),
    [urlInterests]
  )

  const [papers, setPapers] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchLoading, setSearchLoading] = useState<boolean>(false)
  const [userInterests, setUserInterests] = useState<string[]>([])

  const displayInterests = useMemo<string[]>(
    () => convertAbbreviationsToNames(userInterests),
    [userInterests]
  )


  // Fetch feed with retry/backoff
  const fetchFeed = useCallback(
    async (
      interests: string[],
      retry = 0,
      max = 3
    ): Promise<void> => {
      setLoading(true)
      try {
        const qs = interests.map(i => `interests=${encodeURIComponent(i)}`).join("&")
        const res = await fetch(`/api/feed?${qs}`)

        // Rate‐limit retry
        if (res.status === 429 && retry < max) {
          const ra = parseInt(res.headers.get("Retry-After") || "60", 10)
          if (retry === 0) {
            toast.warning(`Rate limit exceeded. Retrying in ${ra}s.`)
          }
          const backoff = ra * 1000 * Math.pow(1.5, retry)
          setTimeout(() => {
            void fetchFeed(interests, retry + 1, max)
          }, backoff)
          return  // <- explicitly return void
        }

        if (!res.ok) {
          throw new Error(`Feed error: ${res.statusText}`)
        }

        const data: SearchResult[] = await res.json()
        setPapers(data)
      } catch (err) {
        console.error("Error fetching feed:", err)
        toast.error(err instanceof Error ? err.message : "Failed to fetch feed")
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // Semantic search with retry/backoff
  const handleSearch = useCallback(
    async (
      query: string,
      retry = 0,
      max = 3
    ): Promise<void> => {
      setSearchLoading(true)
      try {
        const res = await fetch(
          `/api/search?query=${encodeURIComponent(query)}&limit=20`
        )

        if (res.status === 429 && retry < max) {
          const ra = parseInt(res.headers.get("Retry-After") || "60", 10)
          if (retry === 0) {
            toast.warning(`Rate limit exceeded. Retrying in ${ra}s.`)
          }
          const backoff = ra * 1000 * Math.pow(1.5, retry)
          setTimeout(() => {
            void handleSearch(query, retry + 1, max)
          }, backoff)
          return  // <- explicitly return void
        }

        if (!res.ok) {
          throw new Error(`Search error: ${res.statusText}`)
        }

        const data: SearchResult[] = await res.json()
        setPapers(data)
      } catch (err) {
        console.error("Error searching papers:", err)
        toast.error(err instanceof Error ? err.message : "Failed to search")
      } finally {
        setSearchLoading(false)
      }
    },
    []
  )

  // Load interests → fetch feed. Only re‐runs when interestsKey or urlInterests changes.
  useEffect(() => {
    const load = async (): Promise<void> => {
      if (urlInterests.length > 0) {
        setUserInterests(urlInterests)
        await fetchFeed(urlInterests)
        return
      }

      try {
        const prefRes = await fetch("/api/preferences")
        if (prefRes.ok) {
          const { domains } = await prefRes.json()
          const parsed =
            typeof domains === "string" ? JSON.parse(domains) : domains
          if (Array.isArray(parsed) && parsed.length > 0) {
            setUserInterests(parsed)
            await fetchFeed(parsed)
            return
          }
        }
      } catch {
        // ignore and fall through
      }

      const defaults = ["cs", "math"]
      setUserInterests(defaults)
      await fetchFeed(defaults)
    }

    void load()
  }, [interestsKey, urlInterests, fetchFeed])

  const formattedInterests = useMemo(
    () => joinWithAnd(displayInterests),
    [displayInterests]
  )


  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            {/* Header & Search */}
            <div className="max-w-3xl mx-auto text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">
                Your Research Feed
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Discover papers based on your interests
              </p>
              <SemanticSearch
                onSearch={handleSearch}
                isLoading={searchLoading}
              />
            </div>

            {/* Loading */}
            {(loading || searchLoading) && (
              <div className="flex flex-col items-center justify-center py-12">
                <LoadingAnimation />
              </div>
            )}

            {/* No Results */}
            {!loading && !searchLoading && papers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No papers found. Try different search terms or interests.
                </p>
              </div>
            )}

            {/* Results */}
            {!loading && !searchLoading && papers.length > 0 && (
              <div className="max-w-5xl mx-auto">
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    Showing papers for interests: {formattedInterests}
                  </p>
                </div>
                {papers.map((paper, idx) => (
                  <PaperCard
                    key={`${paper.metadata.paper_id}-${idx}`}
                    paper={paper}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}