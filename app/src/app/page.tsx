"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { MessageCircle, Search, SparkleIcon } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { Chat } from "@/components/chat"
import { LoadingAnimation } from "@/components/loading-animation"
import MarkdownRenderer from "@/components/markdown-renderer"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { toast } from "sonner"
import { LoadingSpinner } from "@/components/loading-spinner"
import { AudioPlayer } from "@/components/audio-player"

interface FigureSummary {
  figure_num: string
  figure_summary: string
}

interface Summaries {
  overall_summary: {
    summary: string
    context: string
  }
  terms_and_summaries: {
    key_terms: string[]
    abs_explanation: string
    meth_explanation: string
    conc_explanation: string
  }
  table_and_figure_summaries: {
    table_and_figure_summaries: FigureSummary[]
  }
}

interface Augmenter {
  title: string
  url: string
}

interface AugmenterGroup {
  term: string
  augmenters: Augmenter[]
}

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
    if (!arxivId.trim() || !currentConvId) return

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
      const data: Augmenter[] = await response.json()

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

    const audioTitle = response.headers.get('x-title') || "Audio Summary"
    
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

            <div className="max-w-xl mx-auto mb-8 flex gap-2">
              <Input
                placeholder="1706.03762"
                value={arxivId}
                onChange={(e) => setArxivId(e.target.value)}
                className="text-lg"
              />
              <Button onClick={handleSearch} disabled={loading || !arxivId.trim()}>
                {loading ? "Loading..." : <Search className="h-5 w-5" />}
              </Button>
              <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <SheetTrigger asChild disabled={!arxivId.trim()}>
                        <Button variant="outline" disabled={!arxivId.trim()}>
                          <MessageCircle className="h-5 w-5" />
                        </Button>
                      </SheetTrigger>
                    </span>
                  </TooltipTrigger>
                  {!arxivId.trim() && <TooltipContent>Please enter an ArXiv ID to start chatting</TooltipContent>}
                </Tooltip>

                <SheetContent
                  side="right"
                  className="w-screen max-w-screen sm:w-[50vw] sm:max-w-[50vw] overflow-hidden"
                >
                  <SheetHeader>
                    <SheetTitle>Chat about the paper</SheetTitle>
                  </SheetHeader>
                  {processingPaper ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <LoadingSpinner />
                    </div>
                  ) : (
                    <Chat convId={convId} arxivId={arxivId} onEndChat={endChat} />
                  )}
                </SheetContent>
              </Sheet>
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <LoadingAnimation />
              </div>
            )}

            {summaries && (
              <div className="max-w-6xl mx-auto space-y-8">
                {!audioUrl && !audioLoading && (
                  <div className="flex justify-center">
                    <Button 
                      onClick={generateAudioSummary} 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white" 
                      disabled={audioLoading}
                    >
                      <SparkleIcon className="mr-2 h-4 w-4" />
                      Motivation
                    </Button>
                  </div>
                )}

                {audioLoading && (
                  <div className="flex flex-col items-center justify-center py-4">
                    <LoadingAnimation />
                  </div>
                )}

                {audioUrl && (
                  <div className="bg-card rounded-lg p-4">
                    <AudioPlayer src={audioUrl} title={audioTitle} />
                  </div>
                )}

                <div className="bg-card rounded-lg p-4">
                  <h2 className="text-2xl font-bold mb-4">Key Terms</h2>
                  <div className="flex flex-wrap gap-2">
                    {summaries.terms_and_summaries.key_terms.map((term, index) => (
                      <Badge
                        key={`${term}-${index}`}
                        className="cursor-pointer hover:bg-primary/90"
                        onClick={() => fetchAugmenters(term)}
                      >
                        {term}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div ref={augmentersRef}>
                  {augmenterGroups.map((group: AugmenterGroup) => (
                    <div key={group.term} className="bg-card rounded-lg p-4 mb-4">
                      <h3 className="text-xl font-semibold mb-3">Resources for - {group.term}</h3>
                      <ul className="space-y-2">
                        {group.augmenters.map((augmenter: Augmenter) => (
                          <li key={augmenter.url}>
                            <a
                              href={augmenter.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {augmenter.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="bg-card rounded-lg p-4">
                  <h2 className="text-2xl font-bold mb-4">Overall Summary</h2>
                  <MarkdownRenderer>{summaries.overall_summary.summary}</MarkdownRenderer>
                </div>

                <div className="bg-card rounded-lg p-4">
                  <h2 className="text-2xl font-bold mb-4">Abstract</h2>
                  <MarkdownRenderer>{summaries.terms_and_summaries.abs_explanation}</MarkdownRenderer>
                </div>

                <div className="bg-card rounded-lg p-4">
                  <h2 className="text-2xl font-bold mb-4">Methodology</h2>
                  <MarkdownRenderer>{summaries.terms_and_summaries.meth_explanation}</MarkdownRenderer>
                </div>

                <div className="bg-card rounded-lg p-4">
                  <h2 className="text-2xl font-bold mb-4">Conclusions</h2>
                  <MarkdownRenderer>{summaries.terms_and_summaries.conc_explanation}</MarkdownRenderer>
                </div>

                {summaries.table_and_figure_summaries.table_and_figure_summaries.length > 0 && (
                  <div className="bg-card rounded-lg p-4">
                    <h2 className="text-2xl font-bold mb-4">Figures and Tables</h2>
                    <div className="space-y-4">
                      {summaries.table_and_figure_summaries.table_and_figure_summaries.map((fig) => (
                        <div key={fig.figure_num} className="border-l-4 border-primary pl-4">
                          <h3 className="font-semibold mb-2">{fig.figure_num}</h3>
                          <MarkdownRenderer>{fig.figure_summary}</MarkdownRenderer>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}