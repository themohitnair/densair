import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string[] } }
) {
  // Await params before accessing its properties
  const { id } = await params;
  
  // Join the id segments with slashes to reconstruct the original arXiv ID
  const arxivId = id.join('/');

  const API_URL = process.env.API_URL;
  const API_KEY = process.env.API_KEY;

  if (!API_URL || !API_KEY) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${API_URL}/arxiv/${arxivId}`, {
      headers: { 'x-api-key': API_KEY }
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `API responded with ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json(await response.json());
    
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}