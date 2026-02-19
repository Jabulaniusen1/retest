import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { userId, currency, amount, toAddress } = await request.json()

    const { data: balance, error: balanceError } = await supabase
      .from('crypto_balances')
      .select('*')
      .eq('user_id', userId)
      .eq('currency', currency)
      .single()

    if (balanceError) throw new Error('Crypto balance not found')

    if (parseFloat(balance.balance) < parseFloat(amount)) {
      throw new Error('Insufficient crypto balance')
    }

    const { error: updateError } = await supabase
      .from('crypto_balances')
      .update({ 
        balance: parseFloat(balance.balance) - parseFloat(amount),
        updated_at: new Date().toISOString()
      })
      .eq('id', balance.id)

    if (updateError) throw updateError

    const { data: transaction, error: txError } = await supabase
      .from('crypto_transactions')
      .insert({
        user_id: userId,
        currency,
        type: 'send',
        amount,
        to_address: toAddress,
        transaction_hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        status: 'completed'
      })
      .select()
      .single()

    if (txError) throw txError

    return NextResponse.json({ transaction })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
