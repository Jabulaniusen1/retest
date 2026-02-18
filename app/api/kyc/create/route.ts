import { NextRequest, NextResponse } from 'next/server'
import { createKYCVerification } from '@/lib/supabase/database'

export async function POST(request: NextRequest) {
  try {
    const { userId, documentType, documentNumber, fullName, dateOfBirth, address } = await request.json()

    if (!userId || !documentType || !documentNumber || !fullName) {
      return NextResponse.json(
        { error: 'userId, documentType, documentNumber, and fullName are required' },
        { status: 400 }
      )
    }

    const kyc = await createKYCVerification(userId, documentType, documentNumber, fullName, dateOfBirth, address)

    return NextResponse.json({ success: true, kyc })
  } catch (error) {
    console.error('Failed to create KYC verification:', error)
    return NextResponse.json(
      { error: 'Failed to create KYC verification' },
      { status: 500 }
    )
  }
}
