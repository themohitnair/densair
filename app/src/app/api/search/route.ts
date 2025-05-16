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
  const categories = searchParams.getAll('categories') || [];
  const categoriesMatchAll = searchParams.get('categories_match_all') === 'true';
  const dateFrom = searchParams.get('date_from') || '';
  const dateTo = searchParams.get('date_to') || '';

  // Validate required parameters
  if (!query && categories.length === 0) {
    return NextResponse.json({ error: 'Either query or categories must be provided' }, { status: 400 });
  }
  
  // Validate limit
  const limitNum = parseInt(limit, 10);
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return NextResponse.json({ error: 'Limit must be between 1 and 100' }, { status: 400 });
  }
  
  // Build query string with all parameters
  let queryString = '';
  
  if (query) {
    queryString += `query=${encodeURIComponent(query.trim())}`;
  }
  
  queryString += `&limit=${limitNum}`;
  
  // Add categories
  categories.forEach(category => {
    queryString += `&categories=${encodeURIComponent(category.trim())}`;
  });
  
  // Add categories match all parameter
  if (categoriesMatchAll) {
    queryString += '&categories_match_all=true';
  }
  
  // Add date filters
  if (dateFrom) {
    queryString += `&date_from=${encodeURIComponent(dateFrom)}`;
  }
  
  if (dateTo) {
    queryString += `&date_to=${encodeURIComponent(dateTo)}`;
  }

  try {
    // Fetch results from your backend
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