import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()

    if (!phone || phone.replace(/\D/g, '').length < 10) {
      return NextResponse.json(
        { error: 'Telefone inválido' },
        { status: 400 }
      )
    }

    const user = await queryOne(
      'SELECT id, name, email, cpf, phone FROM "user" WHERE phone = $1',
      [phone.replace(/\D/g, '')]
    )

    if (user) {
      // Autenticar automaticamente o cliente existente (setar cookie token)
      const response = NextResponse.json({
        exists: true,
        customer: {
          name: user.name,
          phone: user.phone,
          cpf: user.cpf,
        },
      })

      response.cookies.set('token', user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      })

      return response
    }

    return NextResponse.json({
      exists: false,
    })
  } catch (error) {
    console.error('[Check Phone] Error:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar telefone' },
      { status: 500 }
    )
  }
}
