import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const API_URL = process.env.API_URL;
  const API_KEY = process.env.API_KEY;

  if (!API_URL || !API_KEY) {
    return NextResponse.json(
      { error: 'API configuration missing' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${API_URL}/arxiv/${id}`, {
      headers: { 'x-api-key': API_KEY }
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `API responded with ${response.status}: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`Error fetching paper ${id}:`, message);
    
    return NextResponse.json(
      { error: `Failed to fetch paper details: ${message}` },
      { status: 500 }
    );
  }
}