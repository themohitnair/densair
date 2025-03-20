import { NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://localhost:8000'

export async function GET(
  request: Request,
  { params }: { params: { term: string } }
) {
  try {
    const response = await fetch(`${API_URL}/term/${params.term}`)
    if (!response.ok) {
      throw new Error('Failed to fetch term details')
    }
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching term:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch term details' },
      { status: 500 }
    )
  }
}