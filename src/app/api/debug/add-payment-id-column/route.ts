import { NextResponse } from 'next/server'
import { queryOne, queryMany } from '@/lib/db'

export async function GET() {
  try {
    console.log('🔍 Verificando se coluna payment_id existe na tabela livros...')
    
    // Verificar se a coluna já existe
    const checkColumn = await queryMany(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'livros' 
      AND column_name = 'payment_id'
    `)
    
    if (checkColumn.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: '✅ Coluna payment_id já existe!' 
      })
    }
    
    console.log('➕ Adicionando coluna payment_id...')
    
    // Adicionar coluna
    await queryOne(`
      ALTER TABLE livros 
      ADD COLUMN IF NOT EXISTS payment_id TEXT
    `)
    
    console.log('✅ Coluna payment_id adicionada com sucesso!')
    
    // Criar índice para melhor performance
    await queryOne(`
      CREATE INDEX IF NOT EXISTS idx_livros_payment_id 
      ON livros(payment_id)
    `)
    
    console.log('✅ Índice criado com sucesso!')
    
    return NextResponse.json({ 
      success: true, 
      message: '✅ Coluna payment_id adicionada com sucesso!' 
    })
    
  } catch (error) {
    console.error('❌ Erro ao adicionar coluna:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      },
      { status: 500 }
    )
  }
}
