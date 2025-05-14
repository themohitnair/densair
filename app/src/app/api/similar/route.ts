import { NextRequest, NextResponse } from 'next/server'
import type { SearchResult } from '@/types/paper-types'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const API_URL = process.env.API_URL
  const API_KEY = process.env.API_KEY

  if (!API_URL || !API_KEY) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }

  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title')?.trim() ?? ''
  const limit = searchParams.get('limit') ?? '5'

  if (!title) {
    return NextResponse.json(
      { error: 'Title cannot be empty' },
      { status: 400 }
    )
  }

  const qs = new URLSearchParams({ title, limit }).toString()

  try {
    const res = await fetch(`${API_URL}/similar?${qs}`, {
      headers: { 'x-api-key': API_KEY },
    })
    if (!res.ok) {
      throw new Error(`Upstream error: ${res.statusText}`)
    }

    const data: SearchResult[] = await res.json()

    // Enhance each paper with a pdf_url if missing
    const enhanced = data.map((paper) => {
      const { metadata } = paper
      const pdfUrl =
        metadata.pdf_url ||
        `https://arxiv.org/pdf/${metadata.paper_id}.pdf`

      return {
        ...paper,
        metadata: {
          ...metadata,
          pdf_url: pdfUrl,
        },
      }
    })

    return NextResponse.json(enhanced)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}