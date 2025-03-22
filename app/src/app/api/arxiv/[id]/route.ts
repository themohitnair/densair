import { NextResponse } from 'next/server'

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await Promise.resolve(params);

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
    const response = await fetch(`${API_URL}/arxiv/${id}`, {
      headers: { 'x-api-key': API_KEY }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch paper: ${response.statusText}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching paper:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch paper details' },
      { status: 500 }
    );
  }
}