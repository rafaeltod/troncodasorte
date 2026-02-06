import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { name, email, cpf, phone, birthDate, acceptedTerms } = await req.json()

    // Validar campos obrigatórios
    if (!name || !email || !cpf || !phone || !birthDate || !acceptedTerms) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar aceitos ao termos
    if (!acceptedTerms) {
      return NextResponse.json(
        { error: 'Você precisa aceitar os Termos e Condições' },
        { status: 400 }
      )
    }

    // Verificar se o CPF já existe
    const existingCpf = await queryOne(
      'SELECT * FROM "user" WHERE cpf = $1',
      [cpf]
    )

    if (existingCpf) {
      return NextResponse.json(
        { error: 'Esse CPF já está registrado' },
        { status: 400 }
      )
    }

    // Verificar se o email já existe
    const existingEmail = await queryOne(
      'SELECT * FROM "user" WHERE email = $1',
      [email]
    )

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Esse email já está registrado' },
        { status: 400 }
      )
    }

    // Verificar se o telefone já existe
    const existingPhone = await queryOne(
      'SELECT * FROM "user" WHERE phone = $1',
      [phone]
    )

    if (existingPhone) {
      return NextResponse.json(
        { error: 'Esse telefone já está registrado' },
        { status: 400 }
      )
    }

    // Criar novo usuário
    const user = await queryOne(
      `INSERT INTO "user" (id, name, email, cpf, phone, "birthDate", "acceptedTerms", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id, name, email, cpf, phone, "birthDate", "createdAt"`,
      [name, email, cpf, phone, birthDate, acceptedTerms]
    )

    if (!user) {
      throw new Error('Erro ao criar usuário')
    }

    // Criar resposta com cookie HTTP-only
    const response = NextResponse.json({
      user,
      message: 'Conta criada com sucesso',
    }, { status: 201 })

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
    console.error('Error in register:', error)
    return NextResponse.json(
      { error: 'Erro ao criar conta' },
      { status: 500 }
    )
  }
}
