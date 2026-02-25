import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

// POST - Validar cupom e registrar acesso
export async function POST(req: NextRequest) {
  try {
    const { code, loteId } = await req.json()

    if (!code) {
      return NextResponse.json({ error: 'Código do cupom é obrigatório' }, { status: 400 })
    }

    // Buscar cupom pelo código
    const cupom = await queryOne(
      `SELECT c.*, 
        json_build_object('name', u.name) as vendedor
      FROM cupom c
      JOIN "user" u ON c."vendedorId" = u.id
      WHERE LOWER(c.code) = LOWER($1) AND c.ativo = TRUE`,
      [code.trim()]
    )

    if (!cupom) {
      return NextResponse.json({ error: 'Cupom inválido ou inativo' }, { status: 404 })
    }

    // Verificar se o cupom é específico para um lote
    if (cupom.loteId && loteId && cupom.loteId !== loteId) {
      return NextResponse.json({ error: 'Este cupom não é válido para este lote' }, { status: 400 })
    }

    // Registrar acesso
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    await queryOne(
      `INSERT INTO cupom_acesso (id, "cupomId", ip, "userAgent", "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, NOW())
       RETURNING id`,
      [cupom.id, ip, userAgent]
    )

    return NextResponse.json({
      valid: true,
      cupom: {
        id: cupom.id,
        code: cupom.code,
        discount: cupom.discount,
        tipoDesconto: cupom.tipoDesconto,
        description: cupom.description,
        loteId: cupom.loteId,
        vendedor: cupom.vendedor,
      },
    })
  } catch (error) {
    console.error('Erro ao validar cupom:', error)
    return NextResponse.json({ error: 'Erro ao validar cupom' }, { status: 500 })
  }
}
