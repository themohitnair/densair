"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { toast } from "sonner"
import { LoadingAnimation } from "@/components/loading-animation"
import { PaperCard } from "@/components/paper-card"
import { SemanticSearch } from "@/components/semantic-search"
import type { SearchResult } from "@/types/paper-types"
import { useSearchParams } from "next/navigation"
import { convertAbbreviationsToNames } from "@/constants/arxiv"
import type { SearchFilters } from "@/components/search-filters"

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

  // Read filters from URL
  const urlFilters = useMemo(() => {
    return {
      categories: searchParams.getAll("categories"),
      categoriesMatchAll: searchParams.get("categories_match_all") === "true",
      dateFrom: searchParams.get("date_from"),
      dateTo: searchParams.get("date_to")
    }
  }, [searchParams])

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

  // Build search URL with filters
  const buildSearchUrl = useCallback((query: string, filters: SearchFilters): string => {
    const params = new URLSearchParams()
    
    if (query) params.append("query", query)
    if (filters.categories.length > 0) {
      filters.categories.forEach(cat => params.append("categories", cat))
    }
    if (filters.categoriesMatchAll) params.append("categories_match_all", "true")
    if (filters.dateFrom) params.append("date_from", filters.dateFrom)
    if (filters.dateTo) params.append("date_to", filters.dateTo)
    params.append("limit", "20")
    
    return `/api/search?${params.toString()}`
  }, [])

  // Semantic search with retry/backoff and filters
  const handleSearch = useCallback(
    async (query: string, filters: SearchFilters, retry = 0, max = 3): Promise<void> => {
      setSearchLoading(true)
      try {
        // Update URL to make it shareable without triggering navigation
        const searchUrl = buildSearchUrl(query, filters)
        const urlParams = new URLSearchParams(window.location.search)
        
        urlParams.set("query", query)
        
        // Clear existing filter params
        urlParams.delete("categories")
        urlParams.delete("categories_match_all")
        urlParams.delete("date_from")
        urlParams.delete("date_to")
        
        // Add new filter params
        filters.categories.forEach(cat => urlParams.append("categories", cat))
        if (filters.categoriesMatchAll) urlParams.set("categories_match_all", "true")
        if (filters.dateFrom) urlParams.set("date_from", filters.dateFrom)
        if (filters.dateTo) urlParams.set("date_to", filters.dateTo)
        
        // Update URL without navigation
        window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`)
        
        const res = await fetch(searchUrl)

        if (res.status === 429 && retry < max) {
          const ra = parseInt(res.headers.get("Retry-After") || "60", 10)
          if (retry === 0) {
            toast.warning(`Rate limit exceeded. Retrying in ${ra}s.`)
          }
          const backoff = ra * 1000 * Math.pow(1.5, retry)
          setTimeout(() => void handleSearch(query, filters, retry + 1, max), backoff)
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
    [buildSearchUrl]
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
          <SemanticSearch 
            onSearch={handleSearch} 
            isLoading={searchLoading}
            initialFilters={{
              categories: urlFilters.categories,
              categoriesMatchAll: urlFilters.categoriesMatchAll,
              dateFrom: urlFilters.dateFrom,
              dateTo: urlFilters.dateTo
            }}
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
              No papers found. Try different search terms, interests, or filters.
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