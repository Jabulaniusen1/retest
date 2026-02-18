import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      verificationType, 
      status, 
      rejectionReason, 
      nextSteps 
    } = await request.json()

    if (!userId || !verificationType || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, verificationType, status' },
        { status: 400 }
      )
    }

    await emailService.sendKYCStatusNotification({
      userId,
      verificationType,
      status,
      rejectionReason,
      nextSteps
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending KYC status email:', error)
    return NextResponse.json(
      { error: 'Failed to send KYC status email' },
      { status: 500 }
    )
  }
}
