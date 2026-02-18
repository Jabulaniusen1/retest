import { NextRequest, NextResponse } from 'next/server'
import { getCardsByAccountId } from '@/lib/supabase/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params

    if (!accountId) {
      return NextResponse.json(
        { error: 'accountId is required' },
        { status: 400 }
      )
    }

    const cards = await getCardsByAccountId(accountId)

    return NextResponse.json({ cards })
  } catch (error) {
    console.error('Failed to fetch cards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    )
  }
}
