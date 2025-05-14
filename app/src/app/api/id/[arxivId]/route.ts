import { NextRequest, NextResponse } from 'next/server'
import type { SearchResult } from '@/types/paper-types'

export const runtime = 'nodejs'

// Note: params is a Promise<{ arxivId: string }>
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ arxivId: string }> }
) {
  const API_URL = process.env.API_URL
  const API_KEY = process.env.API_KEY

  if (!API_URL || !API_KEY) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }

  // Await params before destructuring
  const { arxivId } = await params

  // Validate paper ID format
  if (!/^\d{4}\.\d{4,5}(v\d+)?$/.test(arxivId)) {
    return NextResponse.json(
      {
        error:
          "Invalid arXiv ID format. Expected format: YYMM.NNNNN or YYMM.NNNNNvX",
      },
      { status: 400 }
    )
  }

  try {
    const response = await fetch(
      `${API_URL}/id/${encodeURIComponent(arxivId)}`,
      {
        headers: { 'x-api-key': API_KEY },
      }
    )

    if (response.status === 404) {
      return NextResponse.json(
        { error: `Paper with ID '${arxivId}' not found` },
        { status: 404 }
      )
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    const data: SearchResult = await response.json()

    // Add a fallback PDF URL if missing
    const enhancedData = data.metadata.pdf_url
      ? data
      : {
          ...data,
          metadata: {
            ...data.metadata,
            pdf_url: `https://arxiv.org/pdf/${data.metadata.paper_id}.pdf`,
          },
        }

    return NextResponse.json(enhancedData)
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}