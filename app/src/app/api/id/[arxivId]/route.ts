import { NextRequest, NextResponse } from 'next/server'
import { XMLParser } from 'fast-xml-parser'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ arxivId: string }> }
) {
  const { arxivId } = await params

  // 1) Validate arXiv ID
  if (!/^\d{4}\.\d{4,5}(v\d+)?$/.test(arxivId)) {
    return NextResponse.json(
      { error: 'Invalid arXiv ID format' },
      { status: 400 }
    )
  }

  try {
    const feedUrl = `http://export.arxiv.org/api/query?id_list=${encodeURIComponent(
      arxivId
    )}`
    const atomRes = await fetch(feedUrl)
    if (!atomRes.ok) {
      return NextResponse.json(
        { error: `arXiv API responded ${atomRes.status}` },
        { status: atomRes.status }
      )
    }
    const atomXml = await atomRes.text()

    const parser = new XMLParser({
      ignoreAttributes: true,
      removeNSPrefix: true,
    })
    const json = parser.parse(atomXml)

    const entry = Array.isArray(json.feed.entry)
      ? json.feed.entry[0]
      : json.feed.entry

    const title = entry?.title?.trim()
    if (!title) {
      return NextResponse.json(
        { error: 'Title not found in arXiv response' },
        { status: 502 }
      )
    }

    return NextResponse.json({ title })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
