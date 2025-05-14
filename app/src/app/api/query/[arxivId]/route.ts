import { NextResponse } from 'next/server'

export const maxDuration = 30

export async function POST(
  request: Request,
  { params }: { params: Promise<{ arxivId: string }> }
) {
  const { arxivId } = await params
  const API_URL = process.env.API_URL!
  const API_KEY = process.env.API_KEY!

  if (!API_URL || !API_KEY) {
    return NextResponse.json(
      { status: 'error', message: 'API configuration missing' },
      { status: 500 }
    )
  }

  try {
    const { query, topK = 5 } = await request.json()

    const response = await fetch(
      `${API_URL}/query/${arxivId}`,
      {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, top_k: topK }),
        cache: 'no-store'
      }
    )

    if (!response.ok) {
      throw new Error(`Upstream API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('Error querying paper:', err)
    const errorMessage = err instanceof Error ? err.message : 'Failed to query paper'
    return NextResponse.json(
      { status: 'error', message: errorMessage },
      { status: 500 }
    )
  }
}