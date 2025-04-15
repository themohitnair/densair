"use client"

import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { toast } from "sonner"

interface CopyButtonProps {
  content: string
  label?: string
}

export function CopyButton({ content, label = "Copy" }: CopyButtonProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    toast.success("Copied to clipboard")
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="ml-2">
      <Copy className="h-4 w-4 mr-1" />
      {label}
    </Button>
  )
}
