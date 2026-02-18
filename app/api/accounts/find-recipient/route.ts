import { NextRequest, NextResponse } from 'next/server'
import { findRecipientAccount } from '@/lib/supabase/database'

export async function POST(request: NextRequest) {
  try {
    const { accountNumber } = await request.json()

    if (!accountNumber) {
      return NextResponse.json(
        { error: 'accountNumber is required' },
        { status: 400 }
      )
    }

    const account = await findRecipientAccount(accountNumber)

    return NextResponse.json({ account })
  } catch (error) {
    console.error('Failed to find recipient account:', error)
    return NextResponse.json(
      { error: 'Failed to find recipient account' },
      { status: 500 }
    )
  }
}
