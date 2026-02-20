import { NextRequest, NextResponse } from 'next/server'
import { deleteBeneficiary } from '@/lib/supabase/database'

export async function POST(request: NextRequest) {
  try {
    const { beneficiaryId } = await request.json()

    if (!beneficiaryId) {
      return NextResponse.json(
        { error: 'beneficiaryId is required' },
        { status: 400 }
      )
    }

    await deleteBeneficiary(beneficiaryId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete beneficiary:', error)
    return NextResponse.json(
      { error: 'Failed to delete beneficiary' },
      { status: 500 }
    )
  }
}
