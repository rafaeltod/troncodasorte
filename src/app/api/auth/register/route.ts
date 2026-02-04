import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { name, email, cpf, phone, password } = await req.json()

    if (!name || !email || !cpf || !phone || !password) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o email já existe
    const existingUser = await queryOne(
      'SELECT * FROM "user" WHERE email = $1',
      [email]
    )

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está registrado' },
        { status: 400 }
      )
    }

    // Criar novo usuário
    const user = await queryOne(
      `INSERT INTO "user" (id, name, email, cpf, phone, password, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, name, email, cpf, phone, "createdAt"`,
      [name, email, cpf, phone, password]
    )

    if (!user) {
      throw new Error('Erro ao criar usuário')
    }

    const token = Buffer.from(JSON.stringify(user)).toString('base64')

    return NextResponse.json({
      user,
      token,
    }, { status: 201 })
  } catch (error) {
    console.error('Error in register:', error)
    return NextResponse.json(
      { error: 'Erro ao criar conta' },
      { status: 500 }
    )
  }
}
