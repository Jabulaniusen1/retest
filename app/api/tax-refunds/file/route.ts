import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { userId, taxYear, refundAmount, accountId } = await request.json()

    const expectedDate = new Date()
    expectedDate.setDate(expectedDate.getDate() + 21)

    const { data: refund, error } = await supabase
      .from('tax_refunds')
      .insert({
        user_id: userId,
        tax_year: taxYear,
        refund_amount: refundAmount,
        account_id: accountId,
        status: 'pending',
        expected_date: expectedDate.toISOString().split('T')[0],
        filing_date: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ refund })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
