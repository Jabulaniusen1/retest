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
    const month = searchParams.get('month')

    let query = supabase
      .from('spending_categories')
      .select('*')
      .eq('user_id', userId)

    if (month) {
      query = query.eq('month', month)
    }

    const { data: categories, error } = await query
      .order('total_spent', { ascending: false })

    if (error) throw error

    return NextResponse.json({ categories: categories || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
