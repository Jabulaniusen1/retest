import { NextRequest, NextResponse } from 'next/server'
import { createBeneficiary } from '@/lib/supabase/database'

export async function POST(request: NextRequest) {
  try {
    const { userId, accountNumber, accountName, bankName } = await request.json()

    if (!userId || !accountNumber || !accountName) {
      return NextResponse.json(
        { error: 'userId, accountNumber, and accountName are required' },
        { status: 400 }
      )
    }

    const beneficiary = await createBeneficiary({
      user_id: userId,
      name: accountName,
      account_number: accountNumber,
      nickname: bankName
    })

    return NextResponse.json({ success: true, beneficiary })
  } catch (error) {
    console.error('Failed to create beneficiary:', error)
    return NextResponse.json(
      { error: 'Failed to create beneficiary' },
      { status: 500 }
    )
  }
}
