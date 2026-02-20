import { NextRequest, NextResponse } from 'next/server'
import { markNotificationAsRead } from '@/lib/supabase/database'

export async function POST(request: NextRequest) {
  try {
    const { notificationId } = await request.json()

    if (!notificationId) {
      return NextResponse.json(
        { error: 'notificationId is required' },
        { status: 400 }
      )
    }

    const notification = await markNotificationAsRead(notificationId)

    return NextResponse.json({ notification })
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    )
  }
}
