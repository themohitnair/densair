import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const API_URL = process.env.API_URL;
  const API_KEY = process.env.API_KEY;

  if (!API_URL || !API_KEY) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${API_URL}/audiosumm/${id}`, {
      headers: { 'x-api-key': API_KEY },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `API responded with ${response.status}` },
        { status: response.status }
      );
    }

    const audioData = await response.arrayBuffer();

    const contentType =
      response.headers.get('content-type') || 'audio/mpeg';
    const contentDisposition =
      response.headers.get('content-disposition') ||
      `inline; filename="${id}.mp3"`;

    return new Response(audioData, {
      status: 200,
      headers: {
        'content-type': contentType,
        'content-disposition': contentDisposition,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
