import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    // Pega o token do cookie
    const token = req.cookies.get('auth-token')?.value

    console.log('[AUTH/ME] Cookie received:', token ? `✓ ${token.substring(0, 8)}...` : '✗ No token')

    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Decodificar o token (assumindo que o token é um JWT ou ID do usuário)
    // Para simplificar, vou usar o token como userId
    const user = await queryOne(
      `SELECT id, name, email, cpf, phone, "createdAt" FROM "user" WHERE id = $1`,
      [token]
    )

    if (!user) {
      console.log('[AUTH/ME] User not found for token:', token)
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    console.log('[AUTH/ME] User authenticated:', user.email)
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error checking session:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar sessão' },
      { status: 500 }
    )
  }
}
