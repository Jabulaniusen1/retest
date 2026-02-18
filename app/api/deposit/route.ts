import { NextRequest, NextResponse } from 'next/server'
import { depositMoney } from '@/lib/supabase/database'

export async function POST(request: NextRequest) {
  try {
    const { accountId, amount, description } = await request.json()

    if (!accountId || !amount) {
      return NextResponse.json(
        { error: 'accountId and amount are required' },
        { status: 400 }
      )
    }

    const transaction = await depositMoney(accountId, amount, description)

    return NextResponse.json({ success: true, transaction })
  } catch (error: any) {
    console.error('Failed to deposit money:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to deposit money' },
      { status: 500 }
    )
  }
}
