import { NextRequest, NextResponse } from 'next/server'
import { updateCardStatus } from '@/lib/supabase/database'

export async function POST(request: NextRequest) {
  try {
    const { cardId, status } = await request.json()

    if (!cardId || !status) {
      return NextResponse.json(
        { error: 'cardId and status are required' },
        { status: 400 }
      )
    }

    const card = await updateCardStatus(cardId, status)

    return NextResponse.json({ success: true, card })
  } catch (error) {
    console.error('Failed to update card status:', error)
    return NextResponse.json(
      { error: 'Failed to update card status' },
      { status: 500 }
    )
  }
}
