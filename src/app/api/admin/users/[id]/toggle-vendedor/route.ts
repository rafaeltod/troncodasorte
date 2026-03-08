import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // O token é o userId
    const userId = token

    // Verificar se usuário é admin
    const adminResult = await query(
      `SELECT id, "isAdmin" FROM "user" WHERE id = $1`,
      [userId]
    )

    if (!adminResult.rows[0] || !adminResult.rows[0].isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const targetUserId = params.id

    // Buscar usuário alvo
    const userResult = await query(
      `SELECT id, name, email, "isVendedor" FROM "user" WHERE id = $1`,
      [targetUserId]
    )

    if (!userResult.rows[0]) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const user = userResult.rows[0]
    const newVendedorStatus = !user.isVendedor

    // Atualizar status
    await query(
      `UPDATE "user" SET "isVendedor" = $1 WHERE id = $2`,
      [newVendedorStatus, targetUserId]
    )

    return NextResponse.json({
      success: true,
      isVendedor: newVendedorStatus,
      message: `Usuário ${user.name} ${newVendedorStatus ? 'agora é' : 'não é mais'} vendedor`
    })
  } catch (error) {
    console.error('[Toggle Vendedor] Error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário' },
      { status: 500 }
    )
  }
}
