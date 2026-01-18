import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ managerId: string }> }
) {
  try {
    const { managerId } = await params

    const response = await fetch(`https://fantasy.premierleague.com/api/entry/${managerId}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FPL-Tempad/1.0)',
      },
      next: {
        revalidate: 60 // Cache for 1 minute
      }
    })

    if (!response.ok) {
      throw new Error(`FPL API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
      },
    })
  } catch (error) {
    console.error('Failed to fetch manager entry:', error)
    return NextResponse.json(
      { error: 'Failed to fetch manager data' },
      { status: 500 }
    )
  }
}