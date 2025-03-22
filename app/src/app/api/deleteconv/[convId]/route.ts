import { NextResponse } from 'next/server'

export const runtime = 'nodejs';

export async function DELETE(
  request: Request,
  { params }: { params: { convId: string } }
) {
  // Await dynamic parameters
  const { convId } = await Promise.resolve(params);

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
    const response = await fetch(`${API_URL}/deleteconv/${convId}`, {
      method: 'DELETE',
      headers: {
        'x-api-key': API_KEY as string
      }
    });
    if (!response.ok) {
      throw new Error('Failed to end chat session');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error ending chat:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to end chat session' },
      { status: 500 }
    );
  }
}