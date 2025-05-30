"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Chat } from "@/components/chat";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function ChatPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [arxivId, setArxivId] = useState<string>("");
  const [inputId, setInputId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState<boolean>(false);

  // Kick off processing when ?id= appears
  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) return;
    setArxivId(id);
    setInputId(id);
    processPaper(id);
  }, [searchParams]);

  async function processPaper(id: string) {
    setError(null);
    setLoading(true);
    try {
      // Use the path directly without encoding, as Next.js will handle it
      const res = await fetch(`/api/process/${id}`, {
        method: "POST",
        cache: "no-store",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || res.statusText);
      }
      setReady(true);
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Failed to process paper";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inputId.trim()) {
      toast.error("Please enter an ArXiv ID");
      return;
    }
    setReady(false);
    router.push(`/chat?id=${encodeURIComponent(inputId)}`);
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b shadow-sm">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/feed")}
            aria-label="Back to summary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Paper Discussion</h1>
          <form onSubmit={onSubmit} className="flex items-center space-x-2">
            <Input
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              placeholder="e.g. 1706.03762"
              className="w-24 sm:w-32 md:w-48"
            />
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <LoadingSpinner />
            <p className="mt-4 text-muted-foreground">
              Processing paper… this may take a minute.
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {!loading && ready && arxivId && (
          <div className="flex-1 flex flex-col">
            <Chat arxivId={arxivId} stickToBottom />
          </div>
        )}

        {!loading && !ready && !arxivId && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8 bg-muted/50 rounded-lg">
              <h2 className="text-xl font-medium mb-2">No Paper Selected</h2>
              <p className="text-muted-foreground">
                Enter an ArXiv ID above to start a discussion.
              </p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
