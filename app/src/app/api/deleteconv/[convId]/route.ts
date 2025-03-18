import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: { convId: string } }) {
  const { convId } = params

  try {
    // Call the backend API
    const response = await fetch(`http://localhost:8000/deleteconv/${convId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to delete conversation" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error deleting conversation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}