import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const { name, phone } = await req.json()

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Nome e telefone são obrigatórios' },
        { status: 400 }
      )
    }

    const user = await queryOne(
      `UPDATE "user" 
       SET name = $1, phone = $2, "updatedAt" = NOW()
       WHERE id = $3
       RETURNING id, name, email, cpf, phone, "createdAt"`,
      [name, phone, userId]
    )

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar perfil' },
      { status: 500 }
    )
  }
}
