import { NextRequest, NextResponse } from 'next/server'
import { updateProfile } from '@/lib/supabase/database'

export async function POST(request: NextRequest) {
  try {
    const { userId, updates } = await request.json()

    if (!userId || !updates) {
      return NextResponse.json(
        { error: 'userId and updates are required' },
        { status: 400 }
      )
    }

    const profile = await updateProfile(userId, updates)

    return NextResponse.json({ success: true, profile })
  } catch (error) {
    console.error('Failed to update profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
