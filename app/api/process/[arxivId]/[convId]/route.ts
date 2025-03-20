import { NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://localhost:8000'

export async function POST(
  request: Request,
  { params }: { params: { arxivId: string; convId: string } }
) {
  try {
    const response = await fetch(
      `${API_URL}/process/${params.arxivId}/${params.convId}`,
      { method: 'POST' }
    )
    if (!response.ok) {
      throw new Error('Failed to process paper')
    }
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error processing paper:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process paper' },
      { status: 500 }
    )
  }
}