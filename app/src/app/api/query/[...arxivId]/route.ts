import { NextResponse, NextRequest } from 'next/server';

export const maxDuration = 60;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ arxivId: string[] }> }
) {
  const { arxivId } = await params;
  const id = arxivId.join('/');
  
  const API_URL = process.env.API_URL;
  const API_KEY = process.env.API_KEY;

  if (!API_URL || !API_KEY) {
    console.error('Missing env variables');
    return NextResponse.json(
      { status: "error", message: 'API configuration missing' },
      { status: 500 }
    );
  }
  
  try {
    // Parse the request body
    const body = await request.json();
    
    const response = await fetch(
      `${API_URL}/query/${encodeURIComponent(id)}`,
      { 
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        cache: 'no-store'
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText);
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error querying paper:', error);
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : 'Failed to query paper' },
      { status: 500 }
    );
  }
}