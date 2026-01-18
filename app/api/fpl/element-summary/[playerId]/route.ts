import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const { playerId } = await params

    const response = await fetch(
      `https://fantasy.premierleague.com/api/element-summary/${playerId}/`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FPL-Tempad/1.0)',
        },
        next: {
          revalidate: 300 // Cache for 5 minutes
        }
      }
    )

    if (!response.ok) {
      throw new Error(`FPL API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Failed to fetch player summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player data' },
      { status: 500 }
    )
  }
}