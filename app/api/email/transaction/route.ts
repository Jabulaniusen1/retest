import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      transactionType, 
      amount, 
      recipientName, 
      accountNumber, 
      transactionDate, 
      referenceNumber 
    } = await request.json()

    if (!userId || !transactionType || !amount || !accountNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await emailService.sendTransactionNotification({
      userId,
      transactionType,
      amount,
      recipientName,
      accountNumber,
      transactionDate,
      referenceNumber
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending transaction email:', error)
    return NextResponse.json(
      { error: 'Failed to send transaction email' },
      { status: 500 }
    )
  }
}
