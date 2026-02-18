import { NextRequest, NextResponse } from 'next/server'
import { getKYCVerifications } from '@/lib/supabase/database'

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

    const verifications = await getKYCVerifications(userId)

    return NextResponse.json({ verifications })
  } catch (error) {
    console.error('Failed to fetch KYC verifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch KYC verifications' },
      { status: 500 }
    )
  }
}
