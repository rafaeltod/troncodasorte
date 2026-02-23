import { NextRequest, NextResponse } from 'next/server'
import { queryOne, queryMany } from '@/lib/db'

interface RouteProps {
  params: Promise<{ id: string }>
}

// GET - Detalhes de um cupom do vendedor: acessos e compras
export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const user = await queryOne(
      `SELECT id, "isVendedor" FROM "user" WHERE id = $1`,
      [token]
    )
    if (!user || !user.isVendedor) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Verificar que o cupom pertence ao vendedor
    const cupom = await queryOne(
      `SELECT c.*,
        CASE WHEN c."loteId" IS NOT NULL 
          THEN (SELECT json_build_object('id', l.id, 'title', l.title) FROM lotes l WHERE l.id = c."loteId")
          ELSE NULL
        END as lote
      FROM cupom c
      WHERE c.id = $1 AND c."vendedorId" = $2`,
      [id, token]
    )
    if (!cupom) {
      return NextResponse.json({ error: 'Cupom não encontrado' }, { status: 404 })
    }

    // Buscar acessos recentes
    const acessos = await queryMany(
      `SELECT id, ip, "userAgent", "createdAt"
       FROM cupom_acesso
       WHERE "cupomId" = $1
       ORDER BY "createdAt" DESC
       LIMIT 100`,
      [id]
    )

    // Buscar compras com este cupom
    const compras = await queryMany(
      `SELECT l.id, l.livros, l.amount, l.status, l."descontoAplicado", l."createdAt",
        json_build_object('name', u.name, 'email', u.email) as cliente,
        json_build_object('id', lt.id, 'title', lt.title) as lote
      FROM livros l
      LEFT JOIN "user" u ON l."userId" = u.id
      LEFT JOIN lotes lt ON l."raffleId" = lt.id
      WHERE l."cupomId" = $1
      ORDER BY l."createdAt" DESC`,
      [id]
    )

    // Estatísticas
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
