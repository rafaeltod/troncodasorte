import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})

async function addStatusPagoColumn() {
  try {
    console.log('Adicionando coluna statusPago na tabela rafflePurchase...')
    
    // Verificar se coluna já existe
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'rafflePurchase' AND column_name = 'statusPago'
    `)
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ Coluna statusPago já existe!')
      process.exit(0)
    }
    
    // Adicionar coluna
    await pool.query(`
      ALTER TABLE "rafflePurchase"
      ADD COLUMN "statusPago" BOOLEAN DEFAULT false
    `)
    
    console.log('✅ Coluna statusPago adicionada com sucesso!')
    
    // Atualizar compras confirmadas (status = 'confirmed') para statusPago = true
    const result = await pool.query(`
      UPDATE "rafflePurchase"
      SET "statusPago" = true
      WHERE status = 'confirmed'
    `)
    
    console.log(`✅ ${result.rowCount} compra(s) confirmada(s) marcada(s) como statusPago = true`)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

addStatusPagoColumn()
