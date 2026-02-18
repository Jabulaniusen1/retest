import { NextRequest, NextResponse } from 'next/server'
import { getAccountTypes } from '@/lib/supabase/database'

export async function GET(request: NextRequest) {
  try {
    const accountTypes = await getAccountTypes()

    return NextResponse.json({ accountTypes })
  } catch (error) {
    console.error('Failed to fetch account types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch account types' },
      { status: 500 }
    )
  }
}
