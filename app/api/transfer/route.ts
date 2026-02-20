import { NextRequest, NextResponse } from 'next/server'
import { transferMoney } from '@/lib/supabase/database'

export async function POST(request: NextRequest) {
  try {
    const { fromAccountId, toAccountId, amount, description, recipientName, recipientAccountNumber } = await request.json()

    if (!fromAccountId || !amount) {
      return NextResponse.json(
        { error: 'fromAccountId and amount are required' },
        { status: 400 }
      )
    }

    const transaction = await transferMoney(
      fromAccountId, 
      toAccountId || undefined, 
      amount, 
      description,
      recipientName,
      recipientAccountNumber
    )

    return NextResponse.json({ success: true, transaction })
  } catch (error: any) {
    console.error('Failed to transfer money:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to transfer money' },
      { status: 500 }
    )
  }
}
