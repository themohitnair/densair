import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { arxivId: string; convId: string } }) {
  const { arxivId, convId } = params

  try {
    // Call the backend API
    const response = await fetch(`http://localhost:8000/process/${arxivId}/${convId}`, {
      method: "POST",
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to process paper" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error processing paper:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}