require('dotenv').config({ path: '.env' })
const { Pool } = require('pg')

async function migrate() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    console.error('❌ DATABASE_URL não está set!')
    process.exit(1)
  }

  console.log('DATABASE_URL:', dbUrl.substring(0, 30) + '...')

  const pool = new Pool({
    connectionString: dbUrl,
  })

  try {
    console.log('Iniciando migração: permitir NULL em userId para compras anônimas...')
    
    const client = await pool.connect()
    
    // Alterar a coluna para permitir NULL
    await client.query(`
      ALTER TABLE "rafflePurchase" 
      ALTER COLUMN "userId" DROP NOT NULL
    `)
    
    console.log('✅ Migração concluída com sucesso!')
    
    client.release()
  } catch (error) {
    console.error('❌ Erro na migração:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

migrate()
