"use client"

import { Button } from "@/components/ui/button"
import { SparkleIcon } from "lucide-react"
import { LoadingAnimation } from "@/components/loading-animation"
import { AudioPlayer } from "@/components/audio-player"

interface AudioSummarySectionProps {
  arxivId: string
  audioUrl: string | null
  audioLoading: boolean
  audioTitle: string
  generateAudioSummary: () => Promise<void>
}

export function AudioSummarySection({
  audioUrl,
  audioLoading,
  audioTitle,
  generateAudioSummary,
}: AudioSummarySectionProps) {
  return (
    <>
      {!audioUrl && !audioLoading && (
        <div className="flex justify-center">
          <Button
            onClick={generateAudioSummary}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            disabled={audioLoading}
          >
            <SparkleIcon className="mr-2 h-4 w-4" />
            Motivation
          </Button>
        </div>
      )}

      {audioLoading && (
        <div className="flex flex-col items-center justify-center py-4">
          <LoadingAnimation />
        </div>
      )}

      {audioUrl && (
        <div className="bg-background rounded-lg p-4">
          <AudioPlayer src={audioUrl} title={audioTitle} />
        </div>
      )}
    </>
  )
}
