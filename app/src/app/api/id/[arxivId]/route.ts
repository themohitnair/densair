import { NextRequest, NextResponse } from 'next/server'
import { XMLParser } from 'fast-xml-parser'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ arxivId: string }> }
) {
  const { arxivId } = await params

  const decodedArxivId = decodeURIComponent(arxivId)


  const NEW_FORMAT_REGEX = /^\d{4}\.\d{4,5}(v\d+)?$/
  const OLD_FORMAT_REGEX = /^[a-z\-]+(\.[A-Z]{2})?\/\d{7}(v\d+)?$/
  
  if (!NEW_FORMAT_REGEX.test(decodedArxivId) && !OLD_FORMAT_REGEX.test(decodedArxivId)) {
    return NextResponse.json(
      { error: 'Invalid arXiv ID format. Expected format like "1501.00001" or "math/0211159"' },
      { status: 400 }
    )
  }
  try {
    const feedUrl = `http://export.arxiv.org/api/query?id_list=${encodeURIComponent(
      decodedArxivId
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
