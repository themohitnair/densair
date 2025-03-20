import { NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://localhost:8000'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${API_URL}/arxiv/${params.id}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch paper: ${response.statusText}`)
    }
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching paper:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch paper details' },
      { status: 500 }
    )
  }
}