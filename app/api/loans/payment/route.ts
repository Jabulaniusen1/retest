import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { loanId, amount } = await request.json()

    const { data: loan, error: loanError } = await supabase
      .from('loans')
      .select('*')
      .eq('id', loanId)
      .single()

    if (loanError) throw loanError

    const monthlyRate = loan.interest_rate / 100 / 12
    const interestAmount = loan.outstanding_balance * monthlyRate
    const principalAmount = amount - interestAmount
    const newBalance = loan.outstanding_balance - principalAmount

    const { data: payment, error: paymentError } = await supabase
      .from('loan_payments')
      .insert({
        loan_id: loanId,
        amount,
        principal_amount: principalAmount,
        interest_amount: interestAmount,
        status: 'completed'
      })
      .select()
      .single()

    if (paymentError) throw paymentError

    const { error: updateError } = await supabase
      .from('loans')
      .update({
        outstanding_balance: newBalance > 0 ? newBalance : 0,
        status: newBalance <= 0 ? 'paid_off' : 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', loanId)

    if (updateError) throw updateError

    return NextResponse.json({ payment })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
