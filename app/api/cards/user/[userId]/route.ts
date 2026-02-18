import { NextRequest, NextResponse } from 'next/server'
import { getCardsByUserId } from '@/lib/supabase/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const cards = await getCardsByUserId(userId)

    return NextResponse.json({ cards })
  } catch (error) {
    console.error('Failed to fetch cards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    )
  }
}
