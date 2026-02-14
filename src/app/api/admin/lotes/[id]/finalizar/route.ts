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
        { error: 'Acesso negado. Apenas administradores podem finalizar lotes.' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Verificar se o lote existe
    const lote = await queryOne(
      `SELECT id, status FROM lotes WHERE id = $1`,
      [id]
    )

    if (!lote) {
      return NextResponse.json(
        { error: 'Lote não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o lote já está fechado
    if (lote.status === 'closed') {
      return NextResponse.json(
        { error: 'Este lote já está finalizado' },
        { status: 400 }
      )
    }

    if (lote.status === 'drawn') {
      return NextResponse.json(
        { error: 'Este lote já foi finalizado' },
        { status: 400 }
      )
    }

    // Finalizar o lote (mudar status para 'closed')
    const updated = await queryOne(
      `UPDATE lotes 
       SET status = 'closed', "updatedAt" = NOW()
       WHERE id = $1
       RETURNING id, title, status, "updatedAt"`,
      [id]
    )

    return NextResponse.json({
      message: 'Lote finalizado com sucesso',
      lote: updated,
    })
  } catch (error) {
    console.error('Erro ao finalizar campanha:', error)
    return NextResponse.json(
      { error: 'Erro ao finalizar campanha' },
      { status: 500 }
    )
  }
}
