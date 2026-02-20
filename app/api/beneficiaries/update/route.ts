import { NextRequest, NextResponse } from 'next/server'
import { updateBeneficiary } from '@/lib/supabase/database'

export async function POST(request: NextRequest) {
  try {
    const { beneficiaryId, updates } = await request.json()

    if (!beneficiaryId) {
      return NextResponse.json(
        { error: 'beneficiaryId is required' },
        { status: 400 }
      )
    }

    const beneficiary = await updateBeneficiary(beneficiaryId, updates)

    return NextResponse.json({ beneficiary })
  } catch (error) {
    console.error('Failed to update beneficiary:', error)
    return NextResponse.json(
      { error: 'Failed to update beneficiary' },
      { status: 500 }
    )
  }
}
