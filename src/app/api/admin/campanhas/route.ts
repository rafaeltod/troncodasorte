import { NextRequest, NextResponse } from 'next/server'
import { queryOne, queryMany } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Verificar se o usuário é admin
    const user = await queryOne(
      `SELECT id, "isAdmin" FROM "user" WHERE id = $1`,
      [token]
    )

    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta área.' },
        { status: 403 }
      )
    }

    // Buscar todas as campanhas criadas por este admin
    const campanhas = await queryMany(
      `SELECT 
        r.*,
        json_build_object(
          'name', u.name,
          'email', u.email
        ) as creator,
        COALESCE(
          (SELECT COUNT(DISTINCT "userId")::int 
           FROM "rafflePurchase" 
           WHERE "raffleId" = r.id AND status = 'paid'),
          0
        ) as participants
       FROM raffle r
       JOIN "user" u ON r."creatorId" = u.id
       WHERE r."creatorId" = $1
       ORDER BY r."createdAt" DESC`,
      [token]
    )

    return NextResponse.json(campanhas)
  } catch (error) {
    console.error('Error fetching admin campanhas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar campanhas' },
      { status: 500 }
    )
  }
}
