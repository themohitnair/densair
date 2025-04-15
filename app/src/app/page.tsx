"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"
import { toast } from "sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Header } from "@/components/header"
import { SearchBar } from "@/components/search-bar"
import { LoadingAnimation } from "@/components/loading-animation"
import { ChatSheet } from "@/components/chat-sheet"
import { AudioSummarySection } from "@/components/audio-summary-section"
import { KeyTermsSection } from "@/components/key-terms-section"
import { AugmenterSection } from "@/components/augmenter-section"
import { SummarySection } from "@/components/summary-section"
import { FiguresSection } from "@/components/figures-section"
import type { Summaries, AugmenterGroup } from "../types/paper-types"

export default function Home() {
  const [arxivId, setArxivId] = useState("")
  const [summaries, setSummaries] = useState<Summaries | null>(null)
  const [loading, setLoading] = useState(false)
  const [convId, setConvId] = useState("")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [augmenterGroups, setAugmenterGroups] = useState<AugmenterGroup[]>([])
  const [processingPaper, setProcessingPaper] = useState(false)
  const [context, setContext] = useState<string | null>(null)
  const [audioLoading, setAudioLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioTitle, setAudioTitle] = useState<string>("Audio Summary")

  const augmentersRef = useRef<HTMLDivElement>(null)

  const handleSearch = async () => {
    if (!arxivId.trim()) {
      toast.error("Please enter an ArXiv ID")
      return
    }

    setLoading(true)
    setSummaries(null)
    try {
      const response = await fetch(`/api/arxiv/${arxivId}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch paper: ${response.statusText}`)
      }
      const data = await response.json()

      setSummaries(data)
      setContext(data.overall_summary.context)
    } catch (error) {
      console.error("Error fetching summaries:", error)
      toast.error(error instanceof Error ? error.message : "Failed to fetch paper details")
    } finally {
      setLoading(false)
    }
  }

  const endChat = useCallback(async () => {
    if (convId) {
      try {
        const response = await fetch(`/api/deleteconv/${convId}`, {
          method: "DELETE",
        })
        if (!response.ok) {
          throw new Error("Failed to end chat session")
        }
        const data = await response.json()
        if (data.status === "error") {
          throw new Error(data.message)
        }
      } catch (error) {
        console.error("Error ending chat:", error)
        toast.error(error instanceof Error ? error.message : "Failed to properly end chat session")
      } finally {
        setConvId("")
        setSheetOpen(false)
      }
    }
  }, [convId])

  const processPaper = async (currentConvId: string) => {
    if (!arxivId.trim() || !currentConvId) return false

    setProcessingPaper(true)
    try {
      const response = await fetch(`/api/process/${arxivId}/${currentConvId}`, {
        method: "POST",
      })
      if (!response.ok) {
        throw new Error("Failed to process paper")
      }
      const data = await response.json()
      if (data.status !== "success") {
        throw new Error(data.message || "Failed to process paper")
      }
    } catch (error) {
      console.error("Error processing paper:", error)
      toast.error(error instanceof Error ? error.message : "Failed to process paper")
      setSheetOpen(false)
      await endChat()
      return false
    } finally {
      setProcessingPaper(false)
    }
    return true
  }

  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (convId) {
      timeout = setTimeout(
        () => {
          endChat()
        },
        10 * 60 * 1000,
      ) // 10 minutes
    }

    return () => {
      clearTimeout(timeout)
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [convId, endChat, audioUrl])

  const handleSheetOpenChange = async (open: boolean) => {
    if (open && !convId) {
      const newConvId = uuidv4()
      setConvId(newConvId)
      setSheetOpen(true)
      const success = await processPaper(newConvId)
      if (!success) {
        setConvId("")
        setSheetOpen(false)
      }
    } else if (!open && convId) {
      await endChat()
    }
  }

  const fetchAugmenters = async (term: string) => {
    if (!context) {
      toast.error("Context is missing. Try fetching the paper summary first.")
      return
    }

    // Check if the term already exists in augmenterGroups
    if (augmenterGroups.some((group) => group.term === term)) {
      // Scroll to the existing term's section
      augmentersRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      return
    }

    try {
      const response = await fetch(`/api/term/${term}?context=${encodeURIComponent(context)}`)
      if (!response.ok) {
        throw new Error("Failed to fetch term details")
      }
      const data = await response.json()

      setAugmenterGroups((prevGroups) => [...prevGroups, { term, augmenters: data }])

      setTimeout(() => {
        augmentersRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 100)
    } catch (error) {
      console.error("Error fetching augmenters:", error)
      toast.error("Failed to fetch additional information for the term")
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
      const response = await fetch(`/api/audiosumm/${arxivId}`)

      if (!response.ok) {
        throw new Error(`Failed to generate audio summary: ${response.statusText}`)
      }

      const audioTitle = response.headers.get("x-title") || "Audio Summary"

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)

      setAudioTitle(audioTitle)
    } catch (error) {
      console.error("Error generating audio summary:", error)
      toast.error(error instanceof Error ? error.message : "Failed to generate audio summary")
    } finally {
      setAudioLoading(false)
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8 md:py-16">
            <div className="max-w-2xl mx-auto text-center mb-8 md:mb-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">ArXiv Paper Analysis</h1>
              <p className="text-lg text-muted-foreground">Simplifying Research Reading and Literature Reviews</p>
            </div>

            <SearchBar
              arxivId={arxivId}
              setArxivId={setArxivId}
              handleSearch={handleSearch}
              loading={loading}
              sheetOpen={sheetOpen}
              handleSheetOpenChange={handleSheetOpenChange}
            />

            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <LoadingAnimation />
              </div>
            )}

            {summaries && (
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
                  <AugmenterSection augmenterGroups={augmenterGroups} />
                </div>

                <SummarySection title="Overall Summary" content={summaries.overall_summary.summary} />

                <SummarySection title="Abstract" content={summaries.terms_and_summaries.abs_explanation} />

                <SummarySection title="Methodology" content={summaries.terms_and_summaries.meth_explanation} />

                <SummarySection title="Conclusions" content={summaries.terms_and_summaries.conc_explanation} />

                {summaries.table_and_figure_summaries.table_and_figure_summaries.length > 0 && (
                  <FiguresSection figures={summaries.table_and_figure_summaries.table_and_figure_summaries} />
                )}
              </div>
            )}
          </div>
        </main>

        <ChatSheet
          open={sheetOpen}
          onOpenChange={handleSheetOpenChange}
          convId={convId}
          arxivId={arxivId}
          onEndChat={endChat}
          processingPaper={processingPaper}
        />
      </div>
    </TooltipProvider>
  )
}