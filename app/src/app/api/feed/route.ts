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
  const interests = searchParams.getAll('interests');
  const limit = searchParams.get('limit') || '100';

  if (interests.length === 0) {
    return NextResponse.json({ error: 'Interests list cannot be empty' }, { status: 400 });
  }
  
  // Normalize interests
  const normalizedInterests = interests.map(interest => interest.trim().toLowerCase())
    .filter(interest => interest.length > 0);
  
  if (normalizedInterests.length === 0) {
    return NextResponse.json({ error: 'Interests list cannot be empty after normalization' }, { status: 400 });
  }
  
  // Validate limit
  const limitNum = parseInt(limit, 10);
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 200) {
    return NextResponse.json({ error: 'Limit must be between 1 and 200' }, { status: 400 });
  }
  
  const queryString = normalizedInterests.map(i => `interests=${encodeURIComponent(i)}`).join('&') + `&limit=${limitNum}`;

  try {
    // Fetch initial results from your backend
    const response = await fetch(`${API_URL}/feed?${queryString}`, {
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