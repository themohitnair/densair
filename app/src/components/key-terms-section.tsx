"use client"

import { Badge } from "@/components/ui/badge"
import { CopyButton } from "@/components/copy-button"

interface KeyTermsSectionProps {
  terms: string[]
  fetchAugmenters: (term: string) => Promise<void>
}

export function KeyTermsSection({ terms, fetchAugmenters }: KeyTermsSectionProps) {
  return (
    <div className="bg-card rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Key Terms</h2>
        <CopyButton content={terms.join(", ")} label="Copy All" />
      </div>
      <div className="flex flex-wrap gap-2">
        {terms.map((term, index) => (
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
  )
}
