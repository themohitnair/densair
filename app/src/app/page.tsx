import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"
import { auth } from "@/auth"

export default async function Home() {
  const session = await auth()
  const isAuthenticated = !!session?.user

  const getStartedLink = isAuthenticated ? "/feed" : "/auth"

  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
        Making Literature Reviews Easy
      </h1>

      <p className="mt-6 max-w-xl text-sm sm:text-base md:text-lg text-muted-foreground">
        <span className="text-primary font-semibold">densAIr</span> helps you extract,
        summarize, and digest academic papers - so you don’t have to cry into your citations.
      </p>

      <div className="mt-10 flex flex-col sm:flex-row gap-4 sm:gap-10 w-full max-w-md">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href={getStartedLink}>
            {isAuthenticated ? "Get Started" : "Get Started"}
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild className="w-full sm:w-auto">
          <Link
            href="https://github.com/themohitnair/densair"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 justify-center w-full sm:w-auto"
          >
            <Github className="h-4 w-4" />
            <span className="text-sm">View Source on GitHub</span>
          </Link>
        </Button>
      </div>
    </main>
  )
}
