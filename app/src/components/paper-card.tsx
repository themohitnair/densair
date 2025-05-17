"use client"

import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, FileText, ExternalLink, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { SearchResult } from '@/types/paper-types';
import { convertAbbreviationsToNames } from '@/constants/arxiv';
import AutoLaTeX from 'react-autolatex';
import 'katex/dist/katex.min.css'; // Import KaTeX CSS

interface PaperCardProps {
  paper: SearchResult;
}

export function PaperCard({ paper }: PaperCardProps) {
  const router = useRouter();
  const { paper_id, categories, date_updated, title, authors, pdf_url } = paper.metadata;
  
  const formattedDate = new Date(date_updated).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const navigateToChat = () => {
    router.push(`/chat?id=${encodeURIComponent(paper_id)}`);
  };

  const navigateToSummarize = () => {
    router.push(`/summarize?id=${encodeURIComponent(paper_id)}`);
  };

  const openAbstract = () => {
    window.open(`https://arxiv.org/abs/${encodeURIComponent(paper_id)}`, '_blank');
  };

  // Map category abbreviations to full names
  const categoryNames = convertAbbreviationsToNames(categories);

  // LaTeX rendering options with error handling
  const latexOptions = {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false },
      { left: '\\(', right: '\\)', display: false },
      { left: '\\[', right: '\\]', display: true }
    ],
    throwOnError: false,
    errorColor: '#f44336',
    macros: {},
    minRuleThickness: 0.05,
    colorIsTextColor: false,
    maxSize: 500,
    maxExpand: 1000,
    trust: false
  };

  return (
    <Card className="w-full mb-4 hover:shadow-md border-none transition-shadow duration-200">
      <CardContent>
        <div className="mb-4">
          <h3 className="font-semibold text-xl mb-2">
            {/* Safely render title with LaTeX */}
            {title ? (
              <AutoLaTeX 
                options={{
                  ...latexOptions,
                  trust: true,
                  strict: false
                }}
              >{title}</AutoLaTeX>
            ) : (
              paper_id // Fallback to paper_id if no title
            )}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            {authors?.join(', ')}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-3">
            <span className="font-mono">{paper_id}</span>
            <span>&bull;</span>
            <span>Updated: {formattedDate}</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {categoryNames.map((category) => (
              <Badge 
                key={category} 
                style={{ backgroundColor: 'black', color: 'white' }} 
                className="text-xs"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
        

      </CardContent>
      
      <CardFooter className="flex flex-wrap gap-2 pt-2 justify-between">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="default" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={navigateToSummarize}
          >
            <FileText className="h-4 w-4" />
            <span className="sm:inline hidden">Summarize</span>
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={navigateToChat}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="sm:inline hidden">Chat</span>
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">        
          {pdf_url && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => window.open(pdf_url, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
              <span>View PDF</span>
            </Button>
          )}
          <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={openAbstract}
            >
              <Eye className="h-4 w-4" />
              <span>View Abstract</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}