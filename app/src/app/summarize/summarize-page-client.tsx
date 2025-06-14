"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SearchBar } from "@/components/search-bar"
import { LoadingAnimation } from "@/components/loading-animation"
import { AudioSummarySection } from "@/components/audio-summary-section"
import { KeyTermsSection } from "@/components/key-terms-section"
import { AugmenterSection } from "@/components/augmenter-section"
import { SummarySection } from "@/components/summary-section"
import { FiguresSection } from "@/components/figures-section"
import { SimilarPapersSection } from "@/components/similar-papers-section"
import { CitationsSection } from "../../components/citations-section"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import type { Summaries, AugmenterGroup, PaperMetadata } from "@/types/paper-types"

type TitleOnly = Pick<PaperMetadata, "title">

export default function SummarizePageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [arxivId, setArxivId] = useState<string>("")
  const [metadata, setMetadata] = useState<TitleOnly | null>(null)
  const [summaries, setSummaries] = useState<Summaries | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [augmenterGroups, setAugmenterGroups] = useState<AugmenterGroup[]>([])
  const [context, setContext] = useState<string | null>(null)
  const [audioLoading, setAudioLoading] = useState<boolean>(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioTitle, setAudioTitle] = useState<string>("Audio Summary")
  const [augmenterLoading, setAugmenterLoading] = useState<boolean>(false)
  const augmentersRef = useRef<HTMLDivElement>(null)

  // Handle manual search (when user clicks search button)
  const handleSearch = useCallback(async () => {
    if (!arxivId.trim()) {
      toast.error("Please enter an ArXiv ID")
      return
    }
    // Only update the URL - let the useEffect handle the API call
    router.push(`/summarize/?id=${encodeURIComponent(arxivId)}`)
  }, [arxivId, router])

  // Handle URL changes (only runs when search params change)
  useEffect(() => {
    const id = searchParams.get("id")
    if (!id?.trim()) return

    setArxivId(id)

    // Move the fetch logic directly here
    const fetchData = async () => {
      setLoading(true)
      setSummaries(null)
      setMetadata(null)

      try {
        const encodedId = id
          .split("/")
          .map((part) => encodeURIComponent(part))
          .join("/")
        const sumRes = await fetch(`/api/arxiv/${encodedId}`)
        if (!sumRes.ok) throw new Error(sumRes.statusText)
        const sumData = (await sumRes.json()) as Summaries

        setSummaries(sumData)
        setContext(sumData.overall_summary.context)

        const idRes = await fetch(`/api/id/${encodeURIComponent(id)}`)
        if (!idRes.ok) throw new Error(idRes.statusText)
        const { title } = (await idRes.json()) as { title: string }
        setMetadata({ title })
      } catch (err) {
        console.error("Error fetching paper data:", err)
        toast.error(err instanceof Error ? err.message : "Failed to fetch paper")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchParams]) // Only depends on searchParams - no ESLint warning!

  useEffect(() => {
    if (!audioUrl) return
    return () => {
      URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  const fetchAugmenters = async (term: string) => {
    if (!context) {
      toast.error("Context is missing. Try fetching the paper summary first.")
      return
    }
    if (augmenterGroups.some((g) => g.term === term)) {
      augmentersRef.current?.scrollIntoView({ behavior: "smooth" })
      return
    }
    
    setAugmenterLoading(true)
    
    try {
      const res = await fetch(`/api/term/${term}?context=${encodeURIComponent(context)}`)
      if (!res.ok) throw new Error(res.statusText)
      const data = await res.json()
      setAugmenterGroups((prev) => [...prev, { term, augmenters: data }])
      setTimeout(() => augmentersRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
    } catch (err) {
      console.error("Error fetching augmenters:", err)
      toast.error("Failed to fetch additional information for the term")
    } finally {
      setAugmenterLoading(false)
    }
  }



  const generateAudioSummary = async () => {
    if (!arxivId.trim()) {
      toast.error("No paper loaded")
      return
    }
    setAudioLoading(true)
    setAudioUrl(null)
    try {
      const res = await fetch(`/api/audiosumm/${arxivId}`)
      if (!res.ok) throw new Error(res.statusText)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
      setAudioTitle(res.headers.get("x-title") || "Audio Summary")
    } catch (err) {
      console.error("Error generating audio summary:", err)
      toast.error(err instanceof Error ? err.message : "Failed to generate audio summary")
    } finally {
      setAudioLoading(false)
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8 md:py-16">
            {/* Search bar & chat link */}
            <div className="max-w-2xl mx-auto mb-8">
              <SearchBar arxivId={arxivId} setArxivId={setArxivId} handleSearch={handleSearch} loading={loading} />
              {arxivId && (
                <div className="mt-4 flex justify-center">
                  <Button onClick={() => router.push(`/chat?id=${encodeURIComponent(arxivId)}`)} variant="outline">
                    <MessageSquare className="h-4 w-4" /> Chat about this paper
                  </Button>
                </div>
              )}
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <LoadingAnimation />
              </div>
            )}

            {/* No paper */}
            {!loading && !summaries && !metadata && (
              <div className="flex-1 flex items-center justify-center py-12">
                <div className="text-center p-8 bg-muted/50 rounded-lg">
                  <h2 className="text-xl font-medium mb-2">No Paper Selected</h2>
                  <p className="text-muted-foreground">Enter an ArXiv ID above to start.</p>
                </div>
              </div>
            )}

            {/* Content */}
            {!loading && summaries && metadata && (
              <div className="max-w-6xl mx-auto space-y-8">
                <AudioSummarySection
                  arxivId={arxivId}
                  audioUrl={audioUrl}
                  audioLoading={audioLoading}
                  audioTitle={audioTitle}
                  generateAudioSummary={generateAudioSummary}
                />

                <KeyTermsSection terms={summaries.terms_and_summaries.key_terms} fetchAugmenters={fetchAugmenters} />

                <div ref={augmentersRef}>
                  <AugmenterSection 
                    augmenterGroups={augmenterGroups} 
                    loading={augmenterLoading}
                  />
                </div>



                <SummarySection title="Overall Summary" content={summaries.overall_summary.summary} />
                <SummarySection title="Abstract" content={summaries.terms_and_summaries.abs_explanation} />
                <SummarySection title="Methodology" content={summaries.terms_and_summaries.meth_explanation} />
                <SummarySection title="Conclusions" content={summaries.terms_and_summaries.conc_explanation} />

                {summaries.table_and_figure_summaries.table_and_figure_summaries.length > 0 && (
                  <FiguresSection figures={summaries.table_and_figure_summaries.table_and_figure_summaries} />
                )}

                {summaries.citations.citations.length > 0 && (
                  <CitationsSection citations={summaries.citations.citations} />
                )}

                <SimilarPapersSection title={metadata.title} context={context} limit={5} />
              </div>
            )}
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}
