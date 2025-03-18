import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { term: string } }) {
  const term = params.term

  try {
    // Call the backend API
    const response = await fetch(`http://localhost:8000/term/${encodeURIComponent(term)}`)

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch term augmenters" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching term augmenters:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}