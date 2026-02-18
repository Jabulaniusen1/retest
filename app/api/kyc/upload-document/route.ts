import { NextRequest, NextResponse } from 'next/server'
import { uploadKYCDocument } from '@/lib/supabase/database'

export async function POST(request: NextRequest) {
  try {
    const { verificationId, documentType, file } = await request.json()

    if (!verificationId || !documentType || !file) {
      return NextResponse.json(
        { error: 'verificationId, documentType, and file are required' },
        { status: 400 }
      )
    }

    const result = await uploadKYCDocument(verificationId, documentType, file)

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Failed to upload KYC document:', error)
    return NextResponse.json(
      { error: 'Failed to upload KYC document' },
      { status: 500 }
    )
  }
}
