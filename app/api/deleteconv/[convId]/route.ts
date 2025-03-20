import { NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://localhost:8000'

export async function DELETE(
  request: Request,
  { params }: { params: { convId: string } }
) {
  try {
    const response = await fetch(`${API_URL}/deleteconv/${params.convId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to end chat session')
    }
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error ending chat:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to end chat session' },
      { status: 500 }
    )
  }
}