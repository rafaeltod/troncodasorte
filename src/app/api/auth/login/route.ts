import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { cpf, email, phone } = await req.json()

    // CPF é obrigatório
    if (!cpf || !cpf.replace(/\D/g, '') || cpf.replace(/\D/g, '').length !== 11) {
      return NextResponse.json(
        { error: 'CPF válido é obrigatório' },
        { status: 400 }
      )
    }

    // Validar que pelo menos Email OU Telefone foi fornecido
    const hasEmail = email && email.trim() && email.includes('@')
    const hasPhone = phone && phone.replace(/\D/g, '').length >= 10

    if (!hasEmail && !hasPhone) {
      return NextResponse.json(
        { error: 'Informe um email válido ou telefone válido' },
        { status: 400 }
      )
    }

    // Buscar usuário por CPF primeiro (obrigatório)
    let user = await queryOne(
      'SELECT id, name, email, cpf, phone, "birthDate", "createdAt" FROM "user" WHERE cpf = $1',
      [cpf]
    )

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 401 }
      )
    }

    // Validar que o email ou telefone corresponde ao CPF
    if (hasEmail && user.email !== email) {
      return NextResponse.json(
        { error: 'Email não corresponde ao CPF' },
        { status: 401 }
      )
    }

    if (hasPhone && (!user.phone || user.phone !== phone.replace(/\D/g, ''))) {
      return NextResponse.json(
        { error: 'Telefone não corresponde ao CPF' },
        { status: 401 }
      )
    }

    // Criar resposta com cookie HTTP-only
    const response = NextResponse.json({
      user,
      message: 'Login realizado com sucesso',
    })

    // Salvar o ID do usuário em um cookie HTTP-only
    response.cookies.set('token', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[LOGIN] Error in login:', error)
    return NextResponse.json(
      { error: `Erro ao fazer login: ${error instanceof Error ? error.message : 'erro desconhecido'}` },
      { status: 500 }
    )
  }
}
