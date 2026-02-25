import { NextRequest, NextResponse } from 'next/server'
import { queryOne, queryMany } from '@/lib/db'

// GET - Listar todos os cupons (admin)
export async function GET(req: NextRequest) {
  try {
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

    const cupons = await queryMany(
      `SELECT c.*,
        json_build_object('id', u.id, 'name', u.name, 'email', u.email) as vendedor,
        CASE WHEN c."loteId" IS NOT NULL 
          THEN (SELECT json_build_object('id', l.id, 'title', l.title) FROM lotes l WHERE l.id = c."loteId")
          ELSE NULL
        END as lote,
        COALESCE((SELECT COUNT(*)::int FROM cupom_acesso WHERE "cupomId" = c.id), 0) as "totalAcessos",
        COALESCE((SELECT COUNT(*)::int FROM livros WHERE "cupomId" = c.id), 0) as "totalUsos",
        COALESCE((SELECT COUNT(*)::int FROM livros WHERE "cupomId" = c.id AND status = 'confirmed'), 0) as "totalUsosConfirmados"
      FROM cupom c
      JOIN "user" u ON c."vendedorId" = u.id
      ORDER BY c."createdAt" DESC`
    )

    return NextResponse.json(cupons)
  } catch (error) {
    console.error('Erro ao buscar cupons:', error)
    return NextResponse.json({ error: 'Erro ao buscar cupons' }, { status: 500 })
  }
}

// POST - Criar novo cupom (admin)
export async function POST(req: NextRequest) {
  try {
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

    const { code, discount, tipoDesconto, vendedorId, loteId, comissao, description } = await req.json()

    // Validações
    if (!code || !code.trim()) {
      return NextResponse.json({ error: 'Código do cupom é obrigatório' }, { status: 400 })
    }

    if (!vendedorId) {
      return NextResponse.json({ error: 'Vendedor é obrigatório' }, { status: 400 })
    }

    if (discount === undefined || discount < 0) {
      return NextResponse.json({ error: 'Desconto deve ser maior ou igual a 0' }, { status: 400 })
    }

    if (comissao === undefined || comissao < 0) {
      return NextResponse.json({ error: 'Comissão deve ser maior ou igual a 0' }, { status: 400 })
    }

    // Verificar se vendedor existe
    const vendedor = await queryOne(
      `SELECT id, "isVendedor" FROM "user" WHERE id = $1`,
      [vendedorId]
    )
    if (!vendedor) {
      return NextResponse.json({ error: 'Vendedor não encontrado' }, { status: 404 })
    }

    // Marcar como vendedor se ainda não é
    if (!vendedor.isVendedor) {
      await queryOne(
        `UPDATE "user" SET "isVendedor" = TRUE WHERE id = $1 RETURNING id`,
        [vendedorId]
      )
    }

    // Verificar código duplicado
    const existing = await queryOne(
      `SELECT id FROM cupom WHERE LOWER(code) = LOWER($1)`,
      [code.trim()]
    )
    if (existing) {
      return NextResponse.json({ error: 'Já existe um cupom com este código' }, { status: 400 })
    }

    // Verificar lote se informado
    if (loteId) {
      const lote = await queryOne(`SELECT id FROM lotes WHERE id = $1`, [loteId])
      if (!lote) {
        return NextResponse.json({ error: 'Lote não encontrado' }, { status: 404 })
      }
    }

    const cupom = await queryOne(
      `INSERT INTO cupom (id, code, discount, "tipoDesconto", "vendedorId", "loteId", comissao, description, ativo, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, TRUE, NOW(), NOW())
       RETURNING *`,
      [
        code.trim().toUpperCase(),
        discount || 0,
        tipoDesconto || 'percentual',
        vendedorId,
        loteId || null,
        comissao || 0,
        description || null,
      ]
    )

    return NextResponse.json(cupom, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar cupom:', error)
    return NextResponse.json({ error: 'Erro ao criar cupom' }, { status: 500 })
  }
}
