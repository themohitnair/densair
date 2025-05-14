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
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">Making Literature Reviews Easy</h1>

      <p className="mt-6 max-w-xl text-base sm:text-lg text-muted-foreground">
        <span className="text-primary font-semibold">densAIr</span> helps you extract, summarize, and digest academic
        papers — so you don&apos;t have to cry into your citations.
      </p>

      <div className="mt-10 flex flex-row gap-10">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href={getStartedLink}>{isAuthenticated ? "Get Started" : "Get Started"}</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link
            href="https://github.com/themohitnair/densair"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
          >
            <Github className="h-4 w-4" />
            <span className="text-sm">View Source on GitHub</span>
          </Link>
        </Button>
      </div>
    </main>
  )
}