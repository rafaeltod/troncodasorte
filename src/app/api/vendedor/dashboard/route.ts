import { NextRequest, NextResponse } from 'next/server'
import { queryOne, queryMany } from '@/lib/db'

// GET - Dashboard do vendedor: meus cupons com estatísticas
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const user = await queryOne(
      `SELECT id, "isVendedor", name FROM "user" WHERE id = $1`,
      [token]
    )
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }
    if (!user.isVendedor) {
      return NextResponse.json({ error: 'Acesso negado. Você não é um vendedor.' }, { status: 403 })
    }

    // Buscar cupons do vendedor com estatísticas
    const cupons = await queryMany(
      `SELECT c.*,
        CASE WHEN c."loteId" IS NOT NULL 
          THEN (SELECT json_build_object('id', l.id, 'title', l.title) FROM lotes l WHERE l.id = c."loteId")
          ELSE NULL
        END as lote,
        COALESCE((SELECT COUNT(*)::int FROM cupom_acesso WHERE "cupomId" = c.id), 0) as "totalAcessos",
        COALESCE((SELECT COUNT(*)::int FROM livros WHERE "cupomId" = c.id), 0) as "totalUsos",
        COALESCE((SELECT COUNT(*)::int FROM livros WHERE "cupomId" = c.id AND status = 'confirmed'), 0) as "totalUsosConfirmados",
        COALESCE((SELECT SUM(amount)::numeric FROM livros WHERE "cupomId" = c.id AND status = 'confirmed'), 0) as "totalVendas",
        COALESCE((SELECT SUM(amount * c.comissao / 100)::numeric FROM livros WHERE "cupomId" = c.id AND status = 'confirmed'), 0) as "totalComissao"
      FROM cupom c
      WHERE c."vendedorId" = $1
      ORDER BY c."createdAt" DESC`,
      [token]
    )

    // Resumo geral
    const resumo = {
      totalCupons: cupons.length,
      totalAcessos: cupons.reduce((sum: number, c: any) => sum + (c.totalAcessos || 0), 0),
      totalUsos: cupons.reduce((sum: number, c: any) => sum + (c.totalUsos || 0), 0),
      totalUsosConfirmados: cupons.reduce((sum: number, c: any) => sum + (c.totalUsosConfirmados || 0), 0),
      totalVendas: cupons.reduce((sum: number, c: any) => sum + Number(c.totalVendas || 0), 0),
      totalComissao: cupons.reduce((sum: number, c: any) => sum + Number(c.totalComissao || 0), 0),
    }

    return NextResponse.json({ vendedor: user, cupons, resumo })
  } catch (error) {
    console.error('Erro ao buscar dashboard vendedor:', error)
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 })
  }
}
