import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { userId, grantType, title, description, amount } = await request.json()

    const { data: grant, error } = await supabase
      .from('grants')
      .insert({
        user_id: userId,
        grant_type: grantType,
        title,
        description,
        amount,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ grant })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
