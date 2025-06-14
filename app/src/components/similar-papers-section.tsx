import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PaperCard } from "@/components/paper-card";
import { LoadingAnimation } from "@/components/loading-animation";
import type { SearchResult } from "@/types/paper-types";

interface SimilarPapersSectionProps {
  title: string;
  context?: string | null;
  limit?: number;
}

export function SimilarPapersSection({
  title,
  context,
  limit = 5,
}: SimilarPapersSectionProps) {
  const [similarPapers, setSimilarPapers] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchSimilarPapers = async () => {
    if (!title) {
      toast.error("Paper title is missing");
      return;
    }

    setLoading(true);
    try {
      const enhancedTitle = context
        ? `Context: ${context}. ${title}`
        : title;
      const queryParams = new URLSearchParams({
        title: enhancedTitle,
        limit: limit.toString(),
      });

      const response = await fetch(`/api/similar?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch similar papers: ${response.statusText}`,
        );
      }

      const data = await response.json();
      setSimilarPapers(data);
      setIsExpanded(true);
    } catch (error) {
      console.error("Error fetching similar papers:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to fetch similar papers",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-none rounded-lg p-6 bg-background">
      <h2 className="text-xl font-semibold mb-4">
        More like this paper (Similar Papers)
      </h2>

      {!isExpanded && !loading && (
        <div className="text-center py-4">
          <Button onClick={fetchSimilarPapers} variant="outline">
            Find Similar Papers
          </Button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-8">
          <LoadingAnimation />
        </div>
      )}

      {isExpanded && !loading && similarPapers.length === 0 && (
        <p className="text-center py-4 text-muted-foreground">
          No similar papers found.
        </p>
      )}

      {isExpanded && !loading && similarPapers.length > 0 && (
        <div className="grid grid-cols-1 gap-4 mt-4">
          {similarPapers.map((paper, index) => (
            <PaperCard
              key={`${paper.metadata.paper_id}-${index}`}
              paper={paper}
            />
          ))}
        </div>
      )}
    </div>
  );
}
