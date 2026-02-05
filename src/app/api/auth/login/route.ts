import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar usuário pelo email
    const user = await queryOne(
      'SELECT * FROM "user" WHERE email = $1',
      [email]
    )

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    // Remover senha do objeto retornado
    const { password: _, ...userWithoutPassword } = user

    // Criar resposta com cookie HTTP-only
    const response = NextResponse.json({
      user: userWithoutPassword,
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
    console.error('Error in login:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    )
  }
}
