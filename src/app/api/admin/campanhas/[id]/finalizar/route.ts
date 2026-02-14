import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

export async function POST(
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
        { error: 'Acesso negado. Apenas administradores podem finalizar campanhas.' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Verificar se a campanha existe
    const campanha = await queryOne(
      `SELECT id, status FROM raffle WHERE id = $1`,
      [id]
    )

    if (!campanha) {
      return NextResponse.json(
        { error: 'Campanha não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se a campanha já está fechada
    if (campanha.status === 'closed') {
      return NextResponse.json(
        { error: 'Esta campanha já está finalizada' },
        { status: 400 }
      )
    }

    if (campanha.status === 'drawn') {
      return NextResponse.json(
        { error: 'Esta campanha já foi finalizada' },
        { status: 400 }
      )
    }

    // Finalizar a campanha (mudar status para 'closed')
    const updated = await queryOne(
      `UPDATE raffle 
       SET status = 'closed', "updatedAt" = NOW()
       WHERE id = $1
       RETURNING id, title, status, "updatedAt"`,
      [id]
    )

    return NextResponse.json({
      message: 'Campanha finalizada com sucesso',
      campanha: updated,
    })
  } catch (error) {
    console.error('Erro ao finalizar campanha:', error)
    return NextResponse.json(
      { error: 'Erro ao finalizar campanha' },
      { status: 500 }
    )
  }
}
