import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { userId, serviceName, accountIdentifier } = await request.json()

    const { data: service, error } = await supabase
      .from('payment_services')
      .insert({
        user_id: userId,
        service_name: serviceName,
        account_identifier: accountIdentifier,
        is_verified: false
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ service })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
