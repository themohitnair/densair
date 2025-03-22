import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { arxivId: string; convId: string } }
) {
  const { arxivId, convId } = params;
  const API_URL = process.env.API_URL;
  const API_KEY = process.env.API_KEY;

  if (!API_URL || !API_KEY) {
    console.error('Missing environment variables');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    
    if (!query?.trim()) {
      return NextResponse.json(
        { 
          error: 'Query parameter is required',
          arxivId,
          convId
        },
        { status: 400 }
      );
    }

    const apiUrl = new URL(`${API_URL}/query/${arxivId}/${convId}`);
    apiUrl.searchParams.set('query', query);

    const response = await fetch(apiUrl.toString(), {
      headers: { 
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { 
          error: `API request failed with status ${response.status}`,
          arxivId,
          convId
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json({
      success: true,
      arxivId,
      convId,
      query,
      data
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown query error';
    console.error(`Error querying ${arxivId}/${convId}:`, errorMessage);
    
    return NextResponse.json(
      { 
        error: `Query failed: ${errorMessage}`,
        arxivId,
        convId
      },
      { status: 500 }
    );
  }
}