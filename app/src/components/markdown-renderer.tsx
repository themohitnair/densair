"use client"

import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"

interface MarkdownRendererProps {
  children?: string
  content?: string
  className?: string
}

const MarkdownRenderer = ({ children, content, className }: MarkdownRendererProps) => {
  const markdownContent = content || children || ""

  return (
    <div className={cn("prose prose-neutral dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold mt-6 mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold mt-5 mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold mt-4 mb-2">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="my-3 leading-7">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside my-3 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside my-3 space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="pl-4">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          code: ({ children }) => (
            <code className="bg-secondary px-1.5 py-0.5 rounded text-sm">{children}</code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-border pl-4 my-3 italic">{children}</blockquote>
          ),
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownRenderer