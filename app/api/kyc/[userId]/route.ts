import { NextRequest, NextResponse } from 'next/server'
import { getKYCVerification } from '@/lib/supabase/database'

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

    const kyc = await getKYCVerification(userId)

    return NextResponse.json({ kyc })
  } catch (error) {
    console.error('Failed to fetch KYC verification:', error)
    return NextResponse.json(
      { error: 'Failed to fetch KYC verification' },
      { status: 500 }
    )
  }
}
