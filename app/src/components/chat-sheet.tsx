"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Chat } from "@/components/chat"
import { LoadingSpinner } from "@/components/loading-spinner"

interface ChatSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => Promise<void>
  convId: string
  arxivId: string
  onEndChat: () => Promise<void>
  processingPaper: boolean
}

export function ChatSheet({
  open,
  onOpenChange,
  convId,
  arxivId,
  onEndChat,
  processingPaper,
}: ChatSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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
          <Chat convId={convId} arxivId={arxivId} onEndChat={onEndChat} />
        )}
      </SheetContent>
    </Sheet>
  )
}