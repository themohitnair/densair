"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { toast } from "sonner"
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

export default function FeedPageClient() {
  const searchParams = useSearchParams()

  // Read interests from the URL:
  const urlInterests = useMemo(() => searchParams.getAll("interests"), [searchParams])
  const interestsKey = useMemo(() => urlInterests.join(","), [urlInterests])

  const [papers, setPapers] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchLoading, setSearchLoading] = useState<boolean>(false)
  const [userInterests, setUserInterests] = useState<string[]>([])

  // Convert abbreviations like "cs" → "Computer Science"
  const displayInterests = useMemo(
    () => convertAbbreviationsToNames(userInterests),
    [userInterests]
  )
  const formattedInterests = useMemo(
    () => joinWithAnd(displayInterests),
    [displayInterests]
  )

  // Fetch feed with retry/backoff
  const fetchFeed = useCallback(
    async (interests: string[], retry = 0, max = 3): Promise<void> => {
      setLoading(true)
      try {
        const qs = interests.map(i => `interests=${encodeURIComponent(i)}`).join("&")
        const res = await fetch(`/api/feed?${qs}`)

        if (res.status === 429 && retry < max) {
          const ra = parseInt(res.headers.get("Retry-After") || "60", 10)
          if (retry === 0) {
            toast.warning(`Rate limit exceeded. Retrying in ${ra}s.`)
          }
          const backoff = ra * 1000 * Math.pow(1.5, retry)
          setTimeout(() => void fetchFeed(interests, retry + 1, max), backoff)
          return
        }

        if (!res.ok) throw new Error(`Feed error: ${res.statusText}`)
        const data = (await res.json()) as SearchResult[]
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
    async (query: string, retry = 0, max = 3): Promise<void> => {
      setSearchLoading(true)
      try {
        const res = await fetch(`/api/search?query=${encodeURIComponent(query)}&limit=20`)

        if (res.status === 429 && retry < max) {
          const ra = parseInt(res.headers.get("Retry-After") || "60", 10)
          if (retry === 0) {
            toast.warning(`Rate limit exceeded. Retrying in ${ra}s.`)
          }
          const backoff = ra * 1000 * Math.pow(1.5, retry)
          setTimeout(() => void handleSearch(query, retry + 1, max), backoff)
          return
        }

        if (!res.ok) throw new Error(`Search error: ${res.statusText}`)
        const data = (await res.json()) as SearchResult[]
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

  // On mount or when interestsKey/urlInterests changes → load user prefs or URL interests
  useEffect(() => {
    const load = async () => {
      if (urlInterests.length > 0) {
        setUserInterests(urlInterests)
        await fetchFeed(urlInterests)
        return
      }
      try {
        const prefRes = await fetch("/api/preferences")
        if (prefRes.ok) {
          const { domains } = await prefRes.json()
          const parsed = typeof domains === "string" ? JSON.parse(domains) : domains
          if (Array.isArray(parsed) && parsed.length > 0) {
            setUserInterests(parsed)
            await fetchFeed(parsed)
            return
          }
        }
      } catch {
        // ignore
      }
      const defaults = ["cs", "math"]
      setUserInterests(defaults)
      await fetchFeed(defaults)
    }
    void load()
  }, [interestsKey, urlInterests, fetchFeed])

  return (
    <>
      {/* Header & Search */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Your Research Feed</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Discover papers based on your interests ({formattedInterests})
          </p>
          <SemanticSearch onSearch={handleSearch} isLoading={searchLoading} />
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
            {papers.map((paper, idx) => (
              <PaperCard
                key={`${paper.metadata.paper_id}-${idx}`}
                paper={paper}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
