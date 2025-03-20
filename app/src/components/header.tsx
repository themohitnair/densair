import Link from "next/link"
import { Github } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="bg-background w-full">
      <div className="container flex h-16 items-center justify-between px-4 max-w-full">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold tracking-tight">densAIr</span>
          </Link>
        </div>
        <div className="flex items-center">
          <Button variant="outline" size="sm" asChild>
            <Link href="https://github.com/themohitnair/densair" target="_blank" className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">Source Code</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}