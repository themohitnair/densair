"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import MarkdownRenderer from "@/components/markdown-renderer"
import { LoadingSpinner } from "@/components/loading-spinner"

export interface ChatProps {
  convId: string
  arxivId: string
  onEndChat: () => void
}

export interface Message {
  role: "user" | "assistant"
  content: string
}

export function Chat({ convId, arxivId, onEndChat }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !arxivId || !convId) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setLoading(true)


    try {
      const queryResponse = await fetch(`/api/query/${arxivId}/${convId}?query=${encodeURIComponent(userMessage)}`)

      if (!queryResponse.ok) {
        throw new Error("Failed to get response from the server")
      }

      const queryData = await queryResponse.json()

      if (queryData.error) {
        throw new Error(queryData.error)
      }

      if (queryData.response) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: queryData.response },
        ])
      } else {
        throw new Error("Received empty response from server")
      }
    } catch (error) {
      console.error("Error in chat:", error)
      toast.error(error instanceof Error ? error.message : "Failed to get response")
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant",
          content: "I apologize, but I encountered an error processing your request. Please try again."
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="p-4 space-y-4">
            {messages.map((message, index) => (
              <Card
                key={index}
                className={`p-4 ${
                  message.role === "assistant"
                    ? "bg-secondary"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {message.role === "assistant" ? (
                  <MarkdownRenderer>{message.content}</MarkdownRenderer>
                ) : (
                  message.content
                )}
              </Card>
            ))}
            {loading && (
              <Card className="p-4 bg-secondary">
                <div className="flex items-center gap-2">
                  <LoadingSpinner />
                  <span>Thinking...</span>
                </div>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="border-t mt-auto">
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the paper..."
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              Send
            </Button>
          </div>
        </form>

        <Button variant="destructive" className="mx-4 mb-4" onClick={onEndChat}>
          End Chat
        </Button>
      </div>
    </div>
  )
}