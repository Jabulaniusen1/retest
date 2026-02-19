import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { userId, loanType, amount, termMonths } = await request.json()

    const interestRates: Record<string, number> = {
      personal: 8.5,
      auto: 5.5,
      home: 3.5,
      student: 4.5,
      business: 7.0
    }

    const interestRate = interestRates[loanType] || 8.0
    const monthlyRate = interestRate / 100 / 12
    const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                          (Math.pow(1 + monthlyRate, termMonths) - 1)

    const { data: loan, error } = await supabase
      .from('loans')
      .insert({
        user_id: userId,
        loan_type: loanType,
        amount,
        interest_rate: interestRate,
        term_months: termMonths,
        monthly_payment: monthlyPayment,
        outstanding_balance: amount,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ loan })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
