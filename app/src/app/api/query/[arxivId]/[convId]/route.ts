import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { arxivId: string; convId: string } }) {
  const { arxivId, convId } = params
  const query = request.nextUrl.searchParams.get("query")

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  try {
    // Call the backend API
    const response = await fetch(`http://localhost:8000/query/${arxivId}/${convId}?query=${encodeURIComponent(query)}`)

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to query paper" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error querying paper:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}