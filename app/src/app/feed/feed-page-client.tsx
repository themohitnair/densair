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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function FeedPageClient() {
  const searchParams = useSearchParams()

  // Tab state - default to search if query exists, otherwise feed
  const [activeTab, setActiveTab] = useState<string>(searchParams.has("query") ? "search" : "feed")

  // Read interests from the URL:
  const urlInterests = useMemo(() => searchParams.getAll("interests"), [searchParams])
  const interestsKey = useMemo(() => urlInterests.join(","), [urlInterests])

  // Read filters from URL
  const urlFilters = useMemo(() => {
    return {
      categories: searchParams.getAll("categories"),
      categoriesMatchAll: searchParams.get("categories_match_all") === "true",
      dateFrom: searchParams.get("date_from"),
      dateTo: searchParams.get("date_to"),
    }
  }, [searchParams])

  const [papers, setPapers] = useState<SearchResult[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchLoading, setSearchLoading] = useState<boolean>(false)
  const [userInterests, setUserInterests] = useState<string[]>([])

  // Convert abbreviations like "cs" → "Computer Science"
  const displayInterests = useMemo(() => convertAbbreviationsToNames(userInterests), [userInterests])

  const headerText = useMemo(() => {
    return activeTab === "feed" ? "Your Research Feed" : "xivvy Search Engine"
  }, [activeTab])

  const subHeaderText = useMemo(() => {
    return activeTab === "feed"
      ? "Discover papers based on your interests"
      : "Search for papers by topic, concept, or semantic meaning"
  }, [activeTab])

  // Add this component after the subheader
  const InterestTags = ({ interests }: { interests: string[] }) => {
    if (interests.length === 0) return null
    
    return (
      <div className="flex flex-wrap gap-2 mb-6">
        {interests.map((interest) => (
          <span
            key={interest}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20"
          >
            {interest}
          </span>
        ))}
      </div>
    )
  }

  // Fetch feed with retry/backoff
  const fetchFeed = useCallback(async (interests: string[], retry = 0, max = 3): Promise<void> => {
    setLoading(true)
    try {
      const qs = interests.map((i) => `interests=${encodeURIComponent(i)}`).join("&")
      const res = await fetch(`/api/feed?${qs}`)

      if (res.status === 429 && retry < max) {
        const ra = Number.parseInt(res.headers.get("Retry-After") || "60", 10)
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
  }, [])

  // Build search URL with filters
  const buildSearchUrl = useCallback((query: string, filters: SearchFilters): string => {
    const params = new URLSearchParams()

    if (query) params.append("query", query)
    if (filters.categories.length > 0) {
      filters.categories.forEach((cat) => params.append("categories", cat))
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
        // Switch to search tab
        setActiveTab("search")

        // Update URL to make it shareable without triggering navigation
        const searchUrl = buildSearchUrl(query, filters)
        const urlParams = new URLSearchParams(window.location.search)

        // Clear existing search and filter params
        urlParams.delete("query")
        urlParams.delete("categories")
        urlParams.delete("categories_match_all")
        urlParams.delete("date_from")
        urlParams.delete("date_to")

        // Only add query param if it exists
        if (query.trim()) {
          urlParams.set("query", query)
        }

        // Add new filter params
        filters.categories.forEach((cat) => urlParams.append("categories", cat))
        if (filters.categoriesMatchAll) urlParams.set("categories_match_all", "true")
        if (filters.dateFrom) urlParams.set("date_from", filters.dateFrom)
        if (filters.dateTo) urlParams.set("date_to", filters.dateTo)

        // Preserve interests if they exist
        const interests = searchParams.getAll("interests")
        interests.forEach((interest) => {
          urlParams.append("interests", interest)
        })

        // Update URL without navigation
        window.history.replaceState(
          {},
          "",
          `${window.location.pathname}${urlParams.toString() ? "?" + urlParams.toString() : ""}`,
        )

        const res = await fetch(searchUrl)

        if (res.status === 429 && retry < max) {
          const ra = Number.parseInt(res.headers.get("Retry-After") || "60", 10)
          if (retry === 0) {
            toast.warning(`Rate limit exceeded. Retrying in ${ra}s.`)
          }
          const backoff = ra * 1000 * Math.pow(1.5, retry)
          setTimeout(() => void handleSearch(query, filters, retry + 1, max), backoff)
          return
        }

        if (!res.ok) throw new Error(`Search error: ${res.statusText}`)
        const data = (await res.json()) as SearchResult[]
        setSearchResults(data)
      } catch (err) {
        console.error("Error searching papers:", err)
        toast.error(err instanceof Error ? err.message : "Failed to search")
      } finally {
        setSearchLoading(false)
      }
    },
    [buildSearchUrl, searchParams],
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

  // Check if we should run a search on initial load
  useEffect(() => {
    const query = searchParams.get("query")
    if (query) {
      handleSearch(query, urlFilters)
    }
  }, [searchParams, urlFilters, handleSearch])

  const handleTabChange = (value: string) => {
    setActiveTab(value)

    // If switching to feed tab, remove query from URL
    if (value === "feed") {
      const urlParams = new URLSearchParams(window.location.search)
      urlParams.delete("query")
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}${urlParams.toString() ? "?" + urlParams.toString() : ""}`,
      )
    }
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-4xl font-bold mb-4">{headerText}</h1>
          <p className="text-lg text-muted-foreground mb-4">{subHeaderText}</p>
          {activeTab === "feed" && <InterestTags interests={displayInterests} />}

          {/* Tabs with responsive design */}
          <div className="relative rounded-sm overflow-x-auto">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="flex w-full mb-10">
                <TabsTrigger value="feed" className="flex-1 data-[state=active]:bg-background">
                  Feed
                </TabsTrigger>
                <TabsTrigger value="search" className="flex-1 data-[state=active]:bg-background">
                  Search
                </TabsTrigger>
              </TabsList>

              <TabsContent value="feed">
                {/* Feed content */}
                {loading && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <LoadingAnimation />
                  </div>
                )}

                {!loading && papers.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No papers found in your feed. Try different interests or check back later.
                    </p>
                  </div>
                )}

                {!loading && papers.length > 0 && (
                  <div className="w-full">
                    {papers.map((paper, idx) => (
                      <PaperCard key={`${paper.metadata.paper_id}-${idx}`} paper={paper} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="search">
                {/* Search interface only */}
                <SemanticSearch
                  onSearch={handleSearch}
                  isLoading={searchLoading}
                  initialFilters={{
                    categories: urlFilters.categories,
                    categoriesMatchAll: urlFilters.categoriesMatchAll,
                    dateFrom: urlFilters.dateFrom,
                    dateTo: urlFilters.dateTo,
                  }}
                />

                {/* Search results */}
                {searchLoading && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <LoadingAnimation />
                  </div>
                )}

                {!searchLoading && searchResults.length > 0 && (
                  <div className="w-full mt-8">
                    {searchResults.map((paper, idx) => (
                      <PaperCard key={`${paper.metadata.paper_id}-${idx}`} paper={paper} />
                    ))}
                  </div>
                )}

                {!searchLoading && searchResults.length === 0 && searchParams.has("query") && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No papers found. Try different search terms, interests, or filters.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  )
}