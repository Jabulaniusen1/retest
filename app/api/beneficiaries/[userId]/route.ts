import { NextRequest, NextResponse } from 'next/server'
import { getBeneficiaries } from '@/lib/supabase/database'

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

    const beneficiaries = await getBeneficiaries(userId)

    return NextResponse.json({ beneficiaries })
  } catch (error) {
    console.error('Failed to fetch beneficiaries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch beneficiaries' },
      { status: 500 }
    )
  }
}
