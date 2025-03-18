"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import HighlightedText from "@/components/highlighted-text"
import FigureSummaries from "@/components/figure-summaries"

interface PaperSummaryProps {
  data: {
    overall_summary?: { summary: string }
    terms_and_summaries?: {
      key_terms: string[]
      abs_explanation: string
      meth_explanation: string
      conc_explanation: string
    }
    figure_summaries?: {
      table_and_figure_summaries: Array<{
        figure_type: "table" | "image"
        figure_num: string
        figure_summary: string
      }>
    }
  }
}

export default function PaperSummary({ data }: PaperSummaryProps) {
  const [, setActiveTab] = useState("overall")

  const { overall_summary, terms_and_summaries, figure_summaries } = data

  const keyTerms = terms_and_summaries?.key_terms || []

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Paper Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overall" onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overall">Overall</TabsTrigger>
            <TabsTrigger value="abstract">Abstract</TabsTrigger>
            <TabsTrigger value="methods">Methods</TabsTrigger>
            <TabsTrigger value="figures">Figures & Tables</TabsTrigger>
          </TabsList>

          <TabsContent value="overall" className="mt-0">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4">
                <HighlightedText
                  text={overall_summary?.summary || "No overall summary available."}
                  keyTerms={keyTerms}
                />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="abstract" className="mt-0">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4">
                <HighlightedText
                  text={terms_and_summaries?.abs_explanation || "No abstract explanation available."}
                  keyTerms={keyTerms}
                />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="methods" className="mt-0">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4">
                <HighlightedText
                  text={terms_and_summaries?.meth_explanation || "No methods explanation available."}
                  keyTerms={keyTerms}
                />
                <Separator />
                <HighlightedText
                  text={terms_and_summaries?.conc_explanation || "No conclusion explanation available."}
                  keyTerms={keyTerms}
                />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="figures" className="mt-0">
            <ScrollArea className="h-[60vh]">
              <FigureSummaries figures={figure_summaries?.table_and_figure_summaries || []} keyTerms={keyTerms} />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}