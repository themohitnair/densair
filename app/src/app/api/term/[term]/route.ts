import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { term: string } }
) {
  const { term } = await Promise.resolve(params);

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
    const context = searchParams.get('context');

    if (!context) {
      return NextResponse.json(
        { error: 'Context is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${API_URL}/term/${term}?context=${encodeURIComponent(context)}`,
      { headers: { 'x-api-key': API_KEY as string } }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch term details');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching term:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch term details' },
      { status: 500 }
    );
  }
}