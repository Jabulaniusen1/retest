import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { insightId } = await request.json()

    const { data: insight, error } = await supabase
      .from('financial_insights')
      .update({ is_read: true })
      .eq('id', insightId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ insight })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
