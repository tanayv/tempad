import { NextResponse } from 'next/server'

// Simple in-memory cache for bootstrap-static data
let cachedData: unknown = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

export async function GET() {
  try {
    const now = Date.now()

    // Check if we have valid cached data
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json(cachedData, {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
          'X-Cache': 'HIT',
        },
      })
    }

    // Fetch fresh data
    const response = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FPL-Tempad/1.0)',
      },
      cache: 'no-store' // Disable Next.js caching since we're doing our own
    })

    if (!response.ok) {
      throw new Error(`FPL API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Update cache
    cachedData = data
    cacheTimestamp = now

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'X-Cache': 'MISS',
      },
    })
  } catch (error) {
    console.error('Failed to fetch bootstrap-static:', error)
    return NextResponse.json(
      { error: 'Failed to fetch FPL data' },
      { status: 500 }
    )
  }
}