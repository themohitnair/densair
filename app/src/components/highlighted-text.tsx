"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from "react-markdown"
import LoadingSpinner from "@/components/loading-spinner"

interface HighlightedTextProps {
  text: string
  keyTerms: string[]
}

interface TermAugmenter {
  title: string
  url: string
}

export default function HighlightedText({ text, keyTerms }: HighlightedTextProps) {
  const [selectedTerm, setSelectedTerm] = useState("")
  const [termAugmenters, setTermAugmenters] = useState<TermAugmenter[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleTermClick = async (term: string) => {
    setSelectedTerm(term)
    setLoading(true)
    setDialogOpen(true)

    try {
      const response = await fetch(`/api/term/${encodeURIComponent(term)}`)
      if (!response.ok) {
        throw new Error("Failed to fetch term augmenters")
      }
      const data = await response.json()
      setTermAugmenters(data.term_augmenters || [])
    } catch (error) {
      console.error("Error fetching term augmenters:", error)
    } finally {
      setLoading(false)
    }
  }

  const highlightKeyTerms = (text: string) => {
    if (!text) return ""

    let highlightedText = text

    // Sort terms by length (descending) to avoid partial matches
    const sortedTerms = [...keyTerms].sort((a, b) => b.length - a.length)

    for (const term of sortedTerms) {
      const regex = new RegExp(`\\b${term}\\b`, "gi")
      highlightedText = highlightedText.replace(regex, `**[[${term}]]**`)
    }

    return highlightedText
  }

  const renderMarkdown = (content: string) => {
    if (!content) return null

    const highlightedContent = highlightKeyTerms(content)

    return (
      <ReactMarkdown
        components={{
          p: ({ ...props }) => <p className="mb-4" {...props} />,
          strong: ({ children, ...props }) => {
            // Check if children exists and has at least one element
            const text = children && Array.isArray(children) && children.length > 0 ? String(children[0]) : ""

            if (text && text.startsWith("[[") && text.endsWith("]]")) {
              const term = text.substring(2, text.length - 2)
              return (
                <button
                  onClick={() => handleTermClick(term)}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {term}
                </button>
              )
            }
            return <strong {...props}>{children}</strong>
          },
        }}
      >
        {highlightedContent}
      </ReactMarkdown>
    )
  }

  return (
    <>
      <div className="prose dark:prose-invert max-w-none">{renderMarkdown(text)}</div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Information about &quot;{selectedTerm}&quot;</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {loading ? (
              <div className="flex justify-center p-8">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="space-y-4">
                {termAugmenters.length > 0 ? (
                  termAugmenters.map((augmenter: TermAugmenter, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{augmenter.title}</h3>
                        <a
                          href={augmenter.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                        >
                          {augmenter.url}
                        </a>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    No additional information available for this term.
                  </p>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}