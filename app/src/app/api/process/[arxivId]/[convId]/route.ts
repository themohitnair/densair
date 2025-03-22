import { NextResponse, NextRequest } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ arxivId: string; convId: string }> }
) {
  const { arxivId, convId } = await params

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
    const response = await fetch(
      `${API_URL}/process/${arxivId}/${convId}`,
      { 
        method: 'POST',
        headers: {
          'x-api-key': API_KEY as string,
        }
      }
    );
    if (!response.ok) {
      throw new Error('Failed to process paper');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error processing paper:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process paper' },
      { status: 500 }
    );
  }
}