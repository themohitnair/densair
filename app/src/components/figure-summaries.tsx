"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import HighlightedText from "@/components/highlighted-text"

interface Figure {
  figure_type: "table" | "image"
  figure_num: string
  figure_summary: string
}

interface FigureSummariesProps {
  figures: Figure[]
  keyTerms: string[]
}

export default function FigureSummaries({ figures, keyTerms }: FigureSummariesProps) {
  if (!figures || figures.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500 dark:text-gray-400">No figure or table summaries available.</div>
    )
  }

  // Sort figures by type and number
  const sortedFigures = [...figures].sort((a, b) => {
    // First sort by type (tables first, then images)
    if (a.figure_type !== b.figure_type) {
      return a.figure_type === "table" ? -1 : 1
    }

    // Then sort by figure number
    const aNum = Number.parseInt(a.figure_num.replace(/\D/g, "")) || 0
    const bNum = Number.parseInt(b.figure_num.replace(/\D/g, "")) || 0
    return aNum - bNum
  })

  return (
    <div className="space-y-6">
      {sortedFigures.map((figure, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              {figure.figure_type === "table" ? "Table" : "Figure"} {figure.figure_num}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HighlightedText text={figure.figure_summary} keyTerms={keyTerms} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

