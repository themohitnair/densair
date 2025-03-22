import { NextResponse } from 'next/server'

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: { arxivId: string; convId: string } }
) {
  // Await dynamic parameters
  const { arxivId, convId } = await Promise.resolve(params);

  const API_URL = process.env.API_URL;
  const API_KEY = process.env.API_KEY;

  if (!API_URL || !API_KEY) {
    console.error('Missing env variables');
    return NextResponse.json(
      { error: 'API configuration missing' },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${API_URL}/query/${arxivId}/${convId}?query=${encodeURIComponent(query)}`,
      { headers: { 'x-api-key': API_KEY as string } }
    );
    
    if (!response.ok) {
      throw new Error('Failed to get response from the server');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error querying paper:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get response' },
      { status: 500 }
    );
  }
}