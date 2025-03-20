import { NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://localhost:8000'

export async function GET(
  request: Request,
  { params }: { params: { arxivId: string; convId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${API_URL}/query/${params.arxivId}/${params.convId}?query=${encodeURIComponent(query)}`
    )
    
    if (!response.ok) {
      throw new Error('Failed to get response from the server')
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error querying paper:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get response' },
      { status: 500 }
    )
  }
}