import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})

async function checkStatus() {
  try {
    console.log('Verificando status das compras...\n')
    
    const result = await pool.query(`
      SELECT status, COUNT(*) as total
      FROM "rafflePurchase"
      GROUP BY status
    `)
    
    console.log('Status das compras no banco:')
    result.rows.forEach(row => {
      console.log(`  ${row.status}: ${row.total} compra(s)`)
    })
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

checkStatus()
