"use client"

import { CopyButton } from "@/components/copy-button"
import MarkdownRenderer from "@/components/markdown-renderer"
import type { FigureSummary } from "../types/paper-types"

interface FiguresSectionProps {
  figures: FigureSummary[]
}

export function FiguresSection({ figures }: FiguresSectionProps) {
  return (
    <div className="bg-card rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Figures and Tables</h2>
        <CopyButton
          content={figures.map((fig) => `## ${fig.figure_num}\n\n${fig.figure_summary}`).join("\n\n")}
          label="Copy All"
        />
      </div>
      <div className="space-y-4">
        {figures.map((fig) => (
          <div key={fig.figure_num} className="border-l-4 border-primary pl-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">{fig.figure_num}</h3>
              <CopyButton content={`## ${fig.figure_num}\n\n${fig.figure_summary}`} />
            </div>
            <MarkdownRenderer>{fig.figure_summary}</MarkdownRenderer>
          </div>
        ))}
      </div>
    </div>
  )
}