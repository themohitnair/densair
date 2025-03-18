import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { arxivId: string } }) {
  const arxivId = params.arxivId

  try {
    // Call the backend API
    const response = await fetch(`http://localhost:8000/arxiv/${arxivId}`)

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch paper data" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching paper data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}