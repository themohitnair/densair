import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ convId: string }> }
) {
  const { convId } = await params;

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
    const response = await fetch(`${API_URL}/deleteconv/${convId}`, {
      method: 'DELETE',
      headers: {
        'x-api-key': API_KEY // Removed unnecessary type assertion
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Deletion failed with status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      message: 'Conversation deleted',
      data
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown deletion error';
    console.error(`Error deleting conversation ${convId}:`, errorMessage);
    
    return NextResponse.json(
      { 
        error: `Conversation deletion failed: ${errorMessage}`,
        conversationId: convId
      },
      { status: 500 }
    );
  }
}
