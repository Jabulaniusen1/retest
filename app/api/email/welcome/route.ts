import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { userId, accountNumber } = await request.json()

    if (!userId || !accountNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, accountNumber' },
        { status: 400 }
      )
    }

    await emailService.sendWelcomeEmail({
      userId,
      accountNumber
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return NextResponse.json(
      { error: 'Failed to send welcome email' },
      { status: 500 }
    )
  }
}
