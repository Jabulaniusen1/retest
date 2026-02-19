import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function generateCardNumber(): string {
  const bin = '4532'
  let cardNumber = bin
  for (let i = 0; i < 12; i++) {
    cardNumber += Math.floor(Math.random() * 10)
  }
  return cardNumber
}

function generateCVV(): string {
  return Math.floor(100 + Math.random() * 900).toString()
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { userId, accountId, cardHolderName, spendingLimit } = await request.json()

    const expiryDate = new Date()
    expiryDate.setFullYear(expiryDate.getFullYear() + 3)

    const { data: card, error } = await supabase
      .from('virtual_cards')
      .insert({
        user_id: userId,
        account_id: accountId,
        card_number: generateCardNumber(),
        card_holder_name: cardHolderName,
        expiry_month: expiryDate.getMonth() + 1,
        expiry_year: expiryDate.getFullYear(),
        cvv: generateCVV(),
        card_type: 'virtual',
        status: 'active',
        spending_limit: spendingLimit
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ card })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
