import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Github,
  FileText,
  Search,
  MessageSquare,
  Sparkles,
  Database,
  Zap,
} from "lucide-react";

export default function About() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">About densAIr</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your Research Reading assistant for research papers that intrigue you
        </p>
      </div>

      <section className="mb-16">
        <h2 className="text-3xl font-semibold mb-6">Why densAIr?</h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Research papers are fascinating but time-consuming. densAIr transforms
          how you interact with academic literature, helping you extract
          insights, understand complex concepts, and stay on top of your field
          without drowning in endless PDFs.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-semibold mb-8">Features</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-4 p-4 rounded-lg border">
            <FileText className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Smart Summarization</h3>
              <p className="text-sm text-muted-foreground">
                Get concise, section-wise summaries that understand figures and
                tables in research papers.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 rounded-lg border">
            <Sparkles className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Key Points Extraction</h3>
              <p className="text-sm text-muted-foreground">
                Extract key terms and get corresponding reading links to deepen
                your understanding.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 rounded-lg border">
            <Search className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Semantic Search</h3>
              <p className="text-sm text-muted-foreground">
                Find research papers using natural language queries with topic
                and date filters.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 rounded-lg border">
            <MessageSquare className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Chat with Papers</h3>
              <p className="text-sm text-muted-foreground">
                Ask questions about any paper and get intelligent answers using
                RAG technology.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 rounded-lg border">
            <Database className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Related Papers</h3>
              <p className="text-sm text-muted-foreground">
                Discover related research and build comprehensive understanding
                of any topic.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 rounded-lg border">
            <Zap className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Personalized Feed</h3>
              <p className="text-sm text-muted-foreground">
                Get curated research papers based on your interests and reading
                history.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-semibold mb-6">Free & Open Source</h2>
        <div className="bg-blue-50 dark:bg-blue-950/50 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <p className="text-blue-900 dark:text-blue-100 mb-4">
            densAIr started as a hobby project and remains free to use. To
            ensure fair access for everyone, we&apos;ve implemented reasonable
            rate limits. If a feature doesn&apos;t work immediately, please try
            again in a few minutes.
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            We&apos;re continuously working on improving performance and
            expanding capacity.
          </p>
        </div>
      </section>

      <section className="text-center">
        <h2 className="text-3xl font-semibold mb-6">
          Ready to Transform Your Research?
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/feed">Start Reading</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link
              href="https://github.com/themohitnair/densair"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <Github className="h-4 w-4" />
              View on GitHub
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
