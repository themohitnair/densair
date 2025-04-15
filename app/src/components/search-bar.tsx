"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Search, MessageCircle } from "lucide-react"

interface SearchBarProps {
  arxivId: string
  setArxivId: (id: string) => void
  handleSearch: () => Promise<void>
  loading: boolean
  sheetOpen: boolean
  handleSheetOpenChange: (open: boolean) => Promise<void>
}

export function SearchBar({
  arxivId,
  setArxivId,
  handleSearch,
  loading,
  sheetOpen,
  handleSheetOpenChange,
}: SearchBarProps) {
  return (
    <TooltipProvider>
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
        </Sheet>
      </div>
    </TooltipProvider>
  )
}
