"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function Home() {
  // Removed unused arxivId state
  const [prefix, setPrefix] = useState("")
  const [suffix, setSuffix] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prefix || !suffix) return

    const fullArxivId = `${prefix}.${suffix}`
    setIsLoading(true)
    router.push(`/paper/${fullArxivId}`)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-white dark:bg-black">
      <div className="w-full max-w-3xl space-y-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-black dark:text-white">densAIr</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Get AI-powered summaries and insights from Arxiv papers
        </p>

        <form onSubmit={handleSearch} className="w-full space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-2 w-full">
            <div className="relative flex items-center w-full">
              <div className="flex w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 overflow-hidden">
                <Input
                  type="text"
                  placeholder="YYMM"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-center"
                />
                <div className="flex items-center justify-center px-2 text-xl font-bold">.</div>
                <Input
                  type="text"
                  placeholder="12345"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-center"
                />
              </div>
            </div>
            <Button type="submit" className="w-full md:w-auto" disabled={isLoading || !prefix || !suffix}>
              {isLoading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Search className="h-5 w-5" />
              )}
              <span className="ml-2">Search</span>
            </Button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Enter an Arxiv ID (e.g., 2303.08774)</p>
        </form>
      </div>
    </main>
  )
}