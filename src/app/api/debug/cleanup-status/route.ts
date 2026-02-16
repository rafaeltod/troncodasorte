import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// ⚠️ Endpoint de DEBUG - remover em produção!
export async function POST(req: NextRequest) {
  try {
    // Remover espaços/\n do final de todos os status
    const result = await query(
      `UPDATE lotes 
       SET status = TRIM(status), "updatedAt" = NOW()
       WHERE status != TRIM(status)
       RETURNING id, title, status`
    )

    return NextResponse.json({
      message: 'Status limpos com sucesso',
      updated: result.rows,
    })
  } catch (error) {
    console.error('Error cleaning status:', error)
    return NextResponse.json(
      { error: 'Erro ao limpar status' },
      { status: 500 }
    )
  }
}
