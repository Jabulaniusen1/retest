import { NextRequest, NextResponse } from 'next/server'
import { sendAccountBlockedEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      )
    }

    await sendAccountBlockedEmail(email, name)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to send blocked email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
