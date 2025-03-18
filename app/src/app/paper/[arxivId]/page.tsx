"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { v4 as uuidv4 } from "uuid"
import { ArrowLeft, MessageSquare, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import PaperSummary from "@/components/paper-summary"
import ChatInterface from "@/components/chat-interface"
import LoadingSpinner from "@/components/loading-spinner"

export default function PaperPage() {
  const { arxivId } = useParams()
  const [summaryData, setSummaryData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [chatOpen, setChatOpen] = useState(false)
  const [convId, setConvId] = useState("")
  const [processingStatus, setProcessingStatus] = useState("")

  useEffect(() => {
    const fetchPaperSummary = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/arxiv/${arxivId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch paper summary")
        }
        const data = await response.json()
        setSummaryData(data)
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred while fetching the paper summary"
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    if (arxivId) {
      fetchPaperSummary()
    }
  }, [arxivId])

  const handleOpenChat = async () => {
    const newConvId = uuidv4()
    setConvId(newConvId)

    // Process the paper for vector search
    setProcessingStatus("Processing paper for chat...")
    try {
      const response = await fetch(`/api/process/${arxivId}/${newConvId}`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to process paper")
      }

      const data = await response.json()
      if (data.status === "success") {
        setChatOpen(true)
        setProcessingStatus("")
      } else {
        setProcessingStatus("Error: " + data.message)
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process paper"
      setProcessingStatus("Error: " + errorMessage)
    }
  }

  const handleCloseChat = async () => {
    setChatOpen(false)

    // Delete the conversation vectors
    if (convId) {
      try {
        await fetch(`/api/deleteconv/${convId}`, {
          method: "DELETE",
        })
      } catch (err) {
        console.error("Failed to delete conversation:", err)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-white dark:bg-black">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button asChild className="mt-4">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <h1 className="text-xl font-bold">Arxiv: {arxivId}</h1>
          <Button variant="outline" onClick={handleOpenChat} disabled={!!processingStatus}>
            {processingStatus ? (
              <span className="flex items-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2">{processingStatus}</span>
              </span>
            ) : (
              <>
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat
              </>
            )}
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {summaryData && <PaperSummary data={summaryData} />}
      </main>

      <Dialog
        open={chatOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseChat()
        }}
      >
        <DialogContent className="sm:max-w-[500px] h-[80vh] flex flex-col p-0">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Chat about this paper</h2>
            <Button variant="ghost" size="icon" onClick={handleCloseChat}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatInterface arxivId={arxivId as string} convId={convId} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}