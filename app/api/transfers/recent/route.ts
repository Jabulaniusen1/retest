import { NextRequest, NextResponse } from 'next/server'
import { getRecentTransfers } from '@/lib/supabase/database'

export async function POST(request: NextRequest) {
  try {
    const { userId, limit } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const transfers = await getRecentTransfers(userId, limit)

    return NextResponse.json({ transfers })
  } catch (error) {
    console.error('Failed to fetch recent transfers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent transfers' },
      { status: 500 }
    )
  }
}
