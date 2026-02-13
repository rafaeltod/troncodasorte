import { NextRequest, NextResponse } from 'next/server'
import { queryOne, query } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Buscar campanha
    const campanha = await queryOne(
      `SELECT 
        r.*,
        json_build_object(
          'name', u.name,
          'email', u.email
        ) as creator
       FROM raffle r
       JOIN "user" u ON r."creatorId" = u.id
       WHERE r.id = $1 AND r."creatorId" = $2`,
      [id, token]
    )

    if (!campanha) {
      return NextResponse.json(
        { error: 'Campanha não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(campanha)
  } catch (error) {
    console.error('Error fetching campanha:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar campanha' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await req.json()
    
    const { title, description, prizeAmount, totalQuotas, quotaPrice, status, images } = body

    // Verificar se a campanha pertence ao admin
    const campanha = await queryOne(
      `SELECT id FROM raffle WHERE id = $1 AND "creatorId" = $2`,
      [id, token]
    )

    if (!campanha) {
      return NextResponse.json(
        { error: 'Campanha não encontrada ou você não tem permissão para editá-la' },
        { status: 404 }
      )
    }

    // Atualizar campanha
    const updated = await queryOne(
      `UPDATE raffle 
       SET 
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         "prizeAmount" = COALESCE($3, "prizeAmount"),
         "totalQuotas" = COALESCE($4, "totalQuotas"),
         "quotaPrice" = COALESCE($5, "quotaPrice"),
         status = COALESCE($6, status),
         images = COALESCE($7, images),
         image = COALESCE($8, image),
         "updatedAt" = NOW()
       WHERE id = $9 AND "creatorId" = $10
       RETURNING *`,
      [
        title,
        description,
        prizeAmount,
        totalQuotas,
        quotaPrice,
        status,
        images || null,
        images?.[0] || null,
        id,
        token,
      ]
    )

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating campanha:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar campanha' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Verificar se a campanha pertence ao admin
    const campanha = await queryOne(
      `SELECT id FROM raffle WHERE id = $1 AND "creatorId" = $2`,
      [id, token]
    )

    if (!campanha) {
      return NextResponse.json(
        { error: 'Campanha não encontrada ou você não tem permissão para deletá-la' },
        { status: 404 }
      )
    }

    // Deletar compras associadas primeiro
    await query(
      `DELETE FROM "rafflePurchase" WHERE "raffleId" = $1`,
      [id]
    )

    // Deletar campanha
    await query(
      `DELETE FROM raffle WHERE id = $1 AND "creatorId" = $2`,
      [id, token]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting campanha:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar campanha' },
      { status: 500 }
    )
  }
}
