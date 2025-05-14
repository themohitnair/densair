// components/chat.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import { SendIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
// ← import your skeleton
import { LoadingAnimation } from "./loading-animation"
import MarkdownRenderer from "./markdown-renderer"

type Message = {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface ChatProps {
  arxivId: string
  stickToBottom?: boolean
}

export function Chat({ arxivId, stickToBottom = false }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isWaiting, setIsWaiting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // auto-scroll on new message or skeleton
  useEffect(() => {
    if (stickToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isWaiting, stickToBottom])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isWaiting) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsWaiting(true)

    try {
      const res = await fetch(`/api/query/${arxivId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage.content }),
        cache: "no-store",
      })
      if (!res.ok) throw new Error("Upstream error")

      const { answer } = await res.json()
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: answer ?? "Sorry, I couldn’t find an answer.",
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      console.error(err)
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "There was an error. Please try again.",
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsWaiting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto">
      {/* 1) Message list */}
      <div className="flex-1 overflow-y-auto p-4 pb-[6rem]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <h3 className="text-lg font-medium mb-2">
              Ask questions about this paper
            </h3>
            <p className="text-muted-foreground max-w-md">
              I will answer based on the arXiv paper I am given.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* render past messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-lg break-words rounded-lg px-4 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <MarkdownRenderer content={msg.content} />
                </div>
              </div>
            ))}

            {/* skeleton while waiting for assistant reply */}
            {isWaiting && (
              <div className="flex justify-start">
                <LoadingAnimation className="max-w-lg mb-4" />
              </div>
            )}

            {/* anchor for auto-scroll */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 2) Sticky input bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="mx-auto w-full max-w-5xl relative">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question…"
            rows={2}
            className="pr-12"
            disabled={isWaiting}
          />
          <Button
            size="icon"
            className="absolute right-2 bottom-2"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isWaiting}
          >
            <SendIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}