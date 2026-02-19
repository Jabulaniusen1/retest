import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createClient()
    const { userId } = await params
    const { searchParams } = new URL(request.url)
    const currency = searchParams.get('currency')

    let query = supabase
      .from('crypto_transactions')
      .select('*')
      .eq('user_id', userId)

    if (currency) {
      query = query.eq('currency', currency)
    }

    const { data: transactions, error } = await query
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json({ transactions: transactions || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
