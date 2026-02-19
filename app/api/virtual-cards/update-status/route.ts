import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { cardId, status } = await request.json()

    const { data: card, error } = await supabase
      .from('virtual_cards')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', cardId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ card })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
