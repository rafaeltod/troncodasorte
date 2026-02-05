import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    // Pega o token do cookie
    const token = req.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // O token é o ID do usuário
    const user = await queryOne(
      `SELECT id, name, email, cpf, phone, "createdAt" FROM "user" WHERE id = $1`,
      [token]
    )

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error checking session:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar sessão' },
      { status: 500 }
    )
  }
}
