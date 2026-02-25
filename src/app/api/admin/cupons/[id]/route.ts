import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

interface RouteProps {
  params: Promise<{ id: string }>
}

// PUT - Atualizar cupom (admin)
export async function PUT(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const user = await queryOne(
      `SELECT id, "isAdmin" FROM "user" WHERE id = $1`,
      [token]
    )
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { code, discount, tipoDesconto, vendedorId, loteId, comissao, ativo, description } = await req.json()

    // Verificar se cupom existe
    const existingCupom = await queryOne(`SELECT id FROM cupom WHERE id = $1`, [id])
    if (!existingCupom) {
      return NextResponse.json({ error: 'Cupom não encontrado' }, { status: 404 })
    }

    // Verificar código duplicado (excluindo o mesmo cupom)
    if (code) {
      const duplicate = await queryOne(
        `SELECT id FROM cupom WHERE LOWER(code) = LOWER($1) AND id != $2`,
        [code.trim(), id]
      )
      if (duplicate) {
        return NextResponse.json({ error: 'Já existe um cupom com este código' }, { status: 400 })
      }
    }

    const cupom = await queryOne(
      `UPDATE cupom SET 
        code = COALESCE($1, code),
        discount = COALESCE($2, discount),
        "tipoDesconto" = COALESCE($3, "tipoDesconto"),
        "vendedorId" = COALESCE($4, "vendedorId"),
        "loteId" = $5,
        comissao = COALESCE($6, comissao),
        ativo = COALESCE($7, ativo),
        description = COALESCE($8, description),
        "updatedAt" = NOW()
      WHERE id = $9
      RETURNING *`,
      [
        code ? code.trim().toUpperCase() : null,
        discount !== undefined ? discount : null,
        tipoDesconto || null,
        vendedorId || null,
        loteId || null,
        comissao !== undefined ? comissao : null,
        ativo !== undefined ? ativo : null,
        description !== undefined ? description : null,
        id,
      ]
    )

    return NextResponse.json(cupom)
  } catch (error) {
    console.error('Erro ao atualizar cupom:', error)
    return NextResponse.json({ error: 'Erro ao atualizar cupom' }, { status: 500 })
  }
}

// DELETE - Deletar cupom (admin)
export async function DELETE(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const user = await queryOne(
      `SELECT id, "isAdmin" FROM "user" WHERE id = $1`,
      [token]
    )
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const cupom = await queryOne(`DELETE FROM cupom WHERE id = $1 RETURNING id`, [id])
    if (!cupom) {
      return NextResponse.json({ error: 'Cupom não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Cupom deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar cupom:', error)
    return NextResponse.json({ error: 'Erro ao deletar cupom' }, { status: 500 })
  }
}
