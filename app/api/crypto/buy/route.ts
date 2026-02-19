import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { userId, currency, amount, usdValue } = await request.json()

    const { data: balance, error: balanceError } = await supabase
      .from('crypto_balances')
      .select('*')
      .eq('user_id', userId)
      .eq('currency', currency)
      .single()

    if (balanceError && balanceError.code !== 'PGRST116') {
      throw balanceError
    }

    if (balance) {
      const { error: updateError } = await supabase
        .from('crypto_balances')
        .update({ 
          balance: parseFloat(balance.balance) + parseFloat(amount),
          updated_at: new Date().toISOString()
        })
        .eq('id', balance.id)

      if (updateError) throw updateError
    } else {
      const { error: insertError } = await supabase
        .from('crypto_balances')
        .insert({
          user_id: userId,
          currency,
          balance: amount
        })

      if (insertError) throw insertError
    }

    const { data: transaction, error: txError } = await supabase
      .from('crypto_transactions')
      .insert({
        user_id: userId,
        currency,
        type: 'buy',
        amount,
        usd_value: usdValue,
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
