import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CopyButton } from "@/components/copy-button"

interface CitationsSectionProps {
  citations: string[]
}

export function CitationsSection({ citations }: CitationsSectionProps) {
  if (!citations || citations.length === 0) {
    return null
  }

  const formattedCitationsText = citations
    .map(citation => `• ${citation}`)
    .join('\n');

  return (
    <Card className="border-none rounded-lg p-6 bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-semibold">Citations</CardTitle>
        <CopyButton content={formattedCitationsText} label="Copy All" />
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 space-y-2">
          {citations.map((citation, index) => (
            <li key={index} className="text-md">
              {citation}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}