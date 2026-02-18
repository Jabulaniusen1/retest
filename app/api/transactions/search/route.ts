import { NextRequest, NextResponse } from 'next/server'
import { searchTransactions } from '@/lib/supabase/database'

export async function POST(request: NextRequest) {
  try {
    const { userId, query, startDate, endDate, type, limit } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const transactions = await searchTransactions(userId, query, startDate, endDate, type, limit)

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error('Failed to search transactions:', error)
    return NextResponse.json(
      { error: 'Failed to search transactions' },
      { status: 500 }
    )
  }
}
