"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { FileText } from "lucide-react"

interface SearchBarProps {
  arxivId: string
  setArxivId: (id: string) => void
  handleSearch: () => Promise<void>
  loading: boolean
}

export function SearchBar({ arxivId, setArxivId, handleSearch, loading }: SearchBarProps) {

  return (
    <div className="max-w-xl mx-auto mb-8 flex gap-2">
      <Input
        placeholder="1706.03762"
        value={arxivId}
        onChange={(e) => setArxivId(e.target.value)}
        className="text-lg"
      />
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button onClick={handleSearch} disabled={loading || !arxivId.trim()}>
                {loading ? "Loading..." : <FileText className="h-5 w-5" />}
              </Button>
            </span>
          </TooltipTrigger>
          {!arxivId.trim() && <TooltipContent>Please enter an ArXiv ID to start summarizing</TooltipContent>}
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}