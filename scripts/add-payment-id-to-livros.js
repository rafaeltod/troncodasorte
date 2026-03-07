#!/usr/bin/env node

const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function addPaymentIdColumn() {
  try {
    console.log('🔍 Verificando se coluna payment_id existe na tabela livros...')
    
    // Verificar se a coluna já existe
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'livros' 
      AND column_name = 'payment_id'
    `)
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ Coluna payment_id já existe!')
      return
    }
    
    console.log('➕ Adicionando coluna payment_id...')
    
    // Adicionar coluna
    await pool.query(`
      ALTER TABLE livros 
      ADD COLUMN IF NOT EXISTS payment_id TEXT
    `)
    
    console.log('✅ Coluna payment_id adicionada com sucesso!')
    
    // Criar índice para melhor performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_livros_payment_id 
      ON livros(payment_id)
    `)
    
    console.log('✅ Índice criado com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro ao adicionar coluna:', error)
    throw error
  } finally {
    await pool.end()
  }
}

addPaymentIdColumn()
