import { NextRequest, NextResponse } from 'next/server'

export async function POST(
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
    const response = await fetch(
      `${API_URL}/process/${arxivId}/${convId}`,
      { 
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(await request.json())
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: `Processing failed with status ${response.status}`,
          arxivId,
          convId
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      message: 'Paper processed successfully',
      arxivId,
      convId,
      data
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown processing error';
    console.error(`Error processing paper ${arxivId} for conversation ${convId}:`, errorMessage);
    
    return NextResponse.json(
      { 
        error: `Processing failed: ${errorMessage}`,
        arxivId,
        convId
      },
      { status: 500 }
    );
  }
}