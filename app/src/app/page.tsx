"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MessageCircle, Search } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { v4 as uuidv4 } from "uuid";
import { Chat } from "@/components/chat";

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
  figure_summaries: {
    table_and_figure_summaries: FigureSummary[];
  };
}

export default function Home() {
  const [arxivId, setArxivId] = useState("");
  const [summaries, setSummaries] = useState<Summaries | null>(null);
  const [loading, setLoading] = useState(false);
  const [convId, setConvId] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleSearch = async () => {
    if (!arxivId) return;
    
    setLoading(true);
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
    if (open) {
      setConvId(uuidv4());
    } else if (convId) {
      // Delete conversation when closing the sheet
      fetch(`http://localhost:8000/deleteconv/${convId}`, {
        method: "DELETE",
      }).catch(console.error);
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

        <div className="max-w-xl mx-auto mb-8">
          <div className="flex gap-2">
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
              <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                  <SheetTitle>Chat about the paper</SheetTitle>
                </SheetHeader>
                <Chat convId={convId} arxivId={arxivId} />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {summaries && (
          <Card className="p-6 max-w-4xl mx-auto">
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-3">Overall Summary</h2>
                  <ReactMarkdown>{summaries.overall_summary.summary}</ReactMarkdown>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-3">Abstract</h2>
                  <ReactMarkdown>
                    {summaries.terms_and_summaries.abs_explanation}
                  </ReactMarkdown>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-3">Methods</h2>
                  <ReactMarkdown>
                    {summaries.terms_and_summaries.meth_explanation}
                  </ReactMarkdown>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-3">Conclusions</h2>
                  <ReactMarkdown>
                    {summaries.terms_and_summaries.conc_explanation}
                  </ReactMarkdown>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-3">
                    Figures and Tables
                  </h2>
                  {summaries.figure_summaries.table_and_figure_summaries.map(
                    (fig: FigureSummary, index: number) => (
                      <div key={index} className="mb-4">
                        <h3 className="font-semibold mb-2">{fig.figure_num}</h3>
                        <ReactMarkdown>{fig.figure_summary}</ReactMarkdown>
                      </div>
                    )
                  )}
                </div>
              </div>
            </ScrollArea>
          </Card>
        )}
      </div>
    </main>
  );
}