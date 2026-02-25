import { NextRequest, NextResponse } from 'next/server'
import { queryOne, queryMany } from '@/lib/db'

interface RouteProps {
  params: Promise<{ id: string }>
}

// GET - Detalhes completos de um cupom (admin vê tudo)
export async function GET(req: NextRequest, { params }: RouteProps) {
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

    const cupom = await queryOne(
      `SELECT c.*,
        json_build_object('id', v.id, 'name', v.name, 'email', v.email) as vendedor,
        CASE WHEN c."loteId" IS NOT NULL 
          THEN (SELECT json_build_object('id', l.id, 'title', l.title) FROM lotes l WHERE l.id = c."loteId")
          ELSE NULL
        END as lote
      FROM cupom c
      LEFT JOIN "user" v ON c."vendedorId" = v.id
      WHERE c.id = $1`,
      [id]
    )
    if (!cupom) {
      return NextResponse.json({ error: 'Cupom não encontrado' }, { status: 404 })
    }

    // Buscar acessos recentes (admin vê IP)
    const acessos = await queryMany(
      `SELECT id, ip, "createdAt"
       FROM cupom_acesso
       WHERE "cupomId" = $1
       ORDER BY "createdAt" DESC
       LIMIT 100`,
      [id]
    )

    // Buscar compras com este cupom (admin vê dados completos)
    const compras = await queryMany(
      `SELECT l.id, l.amount, l.status, l."statusPago", l."descontoAplicado", l.payment_id, l.livros, l."createdAt",
        json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'phone', u.phone, 'cpf', u.cpf) as cliente,
        json_build_object('id', lt.id, 'title', lt.title) as lote
      FROM livros l
      LEFT JOIN "user" u ON l."userId" = u.id
      LEFT JOIN lotes lt ON l."raffleId" = lt.id
      WHERE l."cupomId" = $1
      ORDER BY l."createdAt" DESC`,
      [id]
    )

    const stats = {
      totalAcessos: acessos.length,
      totalCompras: compras.length,
      comprasConfirmadas: compras.filter((c: any) => c.status === 'confirmed').length,
      totalVendas: compras
        .filter((c: any) => c.status === 'confirmed')
        .reduce((sum: number, c: any) => sum + Number(c.amount), 0),
      totalComissao: compras
        .filter((c: any) => c.status === 'confirmed')
        .reduce((sum: number, c: any) => sum + (Number(c.amount) * Number(cupom.comissao) / 100), 0),
    }

    return NextResponse.json({ cupom, acessos, compras, stats })
  } catch (error) {
    console.error('Erro ao buscar detalhes do cupom:', error)
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 })
  }
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
