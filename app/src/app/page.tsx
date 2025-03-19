"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MessageCircle, Search } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Chat } from "@/components/chat";
import { LoadingAnimation } from "@/components/loading-animation";
import MarkdownRenderer from "@/components/markdown-renderer";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface FigureSummary {
  figure_num: string;
  figure_summary: string;
}

interface Summaries {
  overall_summary: {
    summary: string;
  };
  terms_and_summaries: {
    key_terms: string[];
    abs_explanation: string;
    meth_explanation: string;
    conc_explanation: string;
  };
  table_and_figure_summaries: {
    table_and_figure_summaries: FigureSummary[];
  };
}

interface Augmenter {
  title: string;
  url: string;
}

interface AugmenterGroup {
  term: string;
  augmenters: Augmenter[];
}

export default function Home() {
  const [arxivId, setArxivId] = useState("");
  const [summaries, setSummaries] = useState<Summaries | null>(null);
  const [loading, setLoading] = useState(false);
  const [convId, setConvId] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [augmenterGroups, setAugmenterGroups] = useState<AugmenterGroup[]>([]);

  const augmentersRef = useRef<HTMLDivElement>(null);

  const handleSearch = async () => {
    if (!arxivId) return;

    setLoading(true);
    setSummaries(null);
    try {
      const response = await fetch(`http://localhost:8000/arxiv/${arxivId}`);
      const data = await response.json();
      setSummaries(data);
    } catch (error) {
      console.error("Error fetching summaries:", error);
    }
    setLoading(false);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open);
    if (open && !convId) {  // Ensure a valid convId is used
      setConvId(uuidv4());
    } else if (convId) {
      fetch(`http://localhost:8000/deleteconv/${convId}`, { method: "DELETE" }).catch(console.error);
    }
  };

  const fetchAugmenters = async (term: string) => {
    try {
      const response = await fetch(`http://localhost:8000/term/${term}`);
      const data: Augmenter[] = await response.json();
  
      setAugmenterGroups((prevGroups) => [...prevGroups, { term, augmenters: data }]);
  
      setTimeout(() => {
        augmentersRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (error) {
      console.error("Error fetching augmenters:", error);
    }
  };
  

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">ArXiv Paper Analysis</h1>
          <p className="text-muted-foreground">
            Enter an ArXiv paper ID to get comprehensive summaries and insights
          </p>
        </div>

        <div className="max-w-xl mx-auto mb-8 flex gap-2">
          <Input
            placeholder="2307.01000"
            value={arxivId}
            onChange={(e) => setArxivId(e.target.value)}
            className="text-lg"
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? "Loading..." : <Search className="h-5 w-5" />}
          </Button>
          <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
            <SheetTrigger asChild>
              <Button variant="outline">
                <MessageCircle className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[600px] sm:w-[800px] md:w-[900px] lg:w-[1000px]">
              <SheetHeader>
                <SheetTitle>Chat about the paper</SheetTitle>
              </SheetHeader>
              <Chat convId={convId} arxivId={arxivId} />
            </SheetContent>
          </Sheet>
        </div>

        {loading ? (
          <div className="space-y-6">
            {["Overall Summary", "Key Terms", "Abstract", "Methodology", "Conclusions", "Figures and Tables"].map((title) => (
              <div key={title} className="p-6 border border-gray-200 rounded-lg">
                <h2 className="text-5xl font-semibold mb-3">{title}</h2>
                <LoadingAnimation />
              </div>
            ))}
          </div>
        ) : summaries && (
          <div className="space-y-6">
            <div className="p-6">
              <h2 className="text-5xl font-semibold mb-1">Overall Summary</h2>
              <h5 className="text-xl text-gray-400 mb-6">A summary of the paper&apos;s core</h5>
              <MarkdownRenderer>{summaries.overall_summary.summary}</MarkdownRenderer>
            </div>

            <div className="p-6">
              <h2 className="text-5xl font-semibold mb-1">Key Terms</h2>
              <h5 className="text-xl text-gray-400 mb-6">The key terms required to understand the paper.</h5>
              <div className="flex flex-wrap gap-2">
                {summaries.terms_and_summaries.key_terms.map((term, index) => (
                  <Tooltip key={index}>
                    <TooltipTrigger 
                      className="text-blue-600 cursor-pointer hover:underline"
                      onClick={() => fetchAugmenters(term)}
                    >
                      <Badge className="text-sm font-medium px-2 py-1">{term}</Badge>
                    </TooltipTrigger>
                    <TooltipContent>{`Click to see more about "${term}"`}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>

            <div className="p-6">
              <h2 className="text-5xl font-semibold mb-1">Abstract</h2>
              <h5 className="text-xl text-gray-400 mb-6">A summary of the paper&apos;s abstract.</h5>
              <MarkdownRenderer>{summaries.terms_and_summaries.abs_explanation}</MarkdownRenderer>
            </div>

            <div className="p-6">
              <h2 className="text-5xl font-semibold mb-1">Methodology</h2>
              <h5 className="text-xl text-gray-400 mb-6">A summary of the methodology employed for research in the paper.</h5>
              <MarkdownRenderer>{summaries.terms_and_summaries.meth_explanation}</MarkdownRenderer>
            </div>

            <div className="p-6">
              <h2 className="text-5xl font-semibold mb-1">Conclusions</h2>
              <h5 className="text-xl text-gray-400 mb-6">A summary of the conclusion of the research done in the paper.</h5>
              <MarkdownRenderer>{summaries.terms_and_summaries.conc_explanation}</MarkdownRenderer>
            </div>

            {summaries.table_and_figure_summaries.table_and_figure_summaries.length > 0 && (
              <div className="p-6">
                <h2 className="text-5xl font-semibold mb-6">Figures and Tables</h2>
                {summaries.table_and_figure_summaries.table_and_figure_summaries.map((fig, index) => (
                  <div key={index} className="mb-4">
                    <h3 className="font-semibold mb-2">{fig.figure_num}</h3>
                    <MarkdownRenderer>{fig.figure_summary}</MarkdownRenderer>
                  </div>
                ))}
              </div>
            )}

            {augmenterGroups.length > 0 && (
              <div ref={augmentersRef} className="space-y-6">
                {augmenterGroups.map((group, index) => (
                  <div key={index} className="p-6 border border-gray-200 rounded-lg">
                    <h2 className="text-5xl font-semibold mb-3">Related Resources for {group.term}</h2>
                    <ul className="list-disc list-inside">
                      {group.augmenters.map((aug, i) => (
                        <li key={i}>
                          <a href={aug.url} target="_blank" rel="noopener noreferrer" className="text-black hover:underline">
                            {aug.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
