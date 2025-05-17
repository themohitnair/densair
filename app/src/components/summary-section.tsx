"use client"

import { CopyButton } from "@/components/copy-button"
import MarkdownRenderer from "@/components/markdown-renderer"

interface SummarySectionProps {
  title: string
  content: string
}

export function SummarySection({ title, content }: SummarySectionProps) {
  return (
    <div className="bg-background rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <CopyButton content={content} />
      </div>
      <MarkdownRenderer>{content}</MarkdownRenderer>
    </div>
  )
}
