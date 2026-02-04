import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true })
  response.cookies.set('auth-token', '', { maxAge: 0 })
  return response
}
