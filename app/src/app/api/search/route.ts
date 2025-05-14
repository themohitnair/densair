import { NextRequest, NextResponse } from 'next/server';
import type { SearchResult } from '@/types/paper-types';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const API_URL = process.env.API_URL;
  const API_KEY = process.env.API_KEY;

  if (!API_URL || !API_KEY) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const limit = searchParams.get('limit') || '10';
  const domain = searchParams.get('domain') || '';
  const startDate = searchParams.get('start_date') || '';
  const endDate = searchParams.get('end_date') || '';

  if (!query || query.trim() === '') {
    return NextResponse.json({ error: 'Query cannot be empty' }, { status: 400 });
  }
  
  // Validate limit
  const limitNum = parseInt(limit, 10);
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 200) {
    return NextResponse.json({ error: 'Limit must be between 1 and 200' }, { status: 400 });
  }
  
  // Build query string with all parameters
  let queryString = `query=${encodeURIComponent(query.trim())}&limit=${limitNum}`;
  
  if (domain) {
    queryString += `&domain=${encodeURIComponent(domain.trim().toLowerCase())}`;
  }
  
  if (startDate) {
    queryString += `&start_date=${encodeURIComponent(startDate)}`;
  }
  
  if (endDate) {
    queryString += `&end_date=${encodeURIComponent(endDate)}`;
  }

  try {
    // Fetch initial results from your backend
    const response = await fetch(`${API_URL}/search?${queryString}`, {
      headers: { 'x-api-key': API_KEY },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data: SearchResult[] = await response.json();
    
    // Add PDF URL if missing
    const enhancedData = data.map(paper => {
      if (!paper.metadata.pdf_url) {
        return {
          ...paper,
          metadata: {
            ...paper.metadata,
            pdf_url: `https://arxiv.org/pdf/${paper.metadata.paper_id}.pdf`
          }
        };
      }
      return paper;
    });

    return NextResponse.json(enhancedData);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}