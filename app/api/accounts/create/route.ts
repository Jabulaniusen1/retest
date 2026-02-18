import { NextRequest, NextResponse } from 'next/server'
import { createAccount, getAccountTypes } from '@/lib/supabase/database'

export async function POST(request: NextRequest) {
  try {
    const { userId, accountType, accountName } = await request.json()

    if (!userId || !accountType) {
      return NextResponse.json(
        { error: 'userId and accountType are required' },
        { status: 400 }
      )
    }

    // Get account type ID from the account type name
    const accountTypes = await getAccountTypes()
    console.log('Available account types:', accountTypes)
    console.log('Looking for account type:', accountType)
    
    const accountTypeRecord = accountTypes.find(t => t.name === accountType)
    console.log('Found account type record:', accountTypeRecord)
    
    if (!accountTypeRecord) {
      console.error('Account type not found. Available types:', accountTypes.map(t => t.name))
      return NextResponse.json(
        { error: `Account type '${accountType}' not found. Available types: ${accountTypes.map(t => t.name).join(', ')}` },
        { status: 400 }
      )
    }
    
    console.log('Using account type ID:', accountTypeRecord.id)

    const account = await createAccount(
      userId,
      accountTypeRecord.id,
      accountName || 'My Checking Account'
    )

    return NextResponse.json({ success: true, account })
  } catch (error) {
    console.error('Failed to create account:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
