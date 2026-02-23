const { Pool } = require('pg')
require('dotenv').config({ path: '.env' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function migrate() {
  const client = await pool.connect()
  try {
    // Add premiosConfig column to store prize configuration as JSON text
    await client.query(`
      ALTER TABLE lotes ADD COLUMN IF NOT EXISTS "premiosConfig" TEXT;
    `)
    console.log('✅ Coluna premiosConfig adicionada com sucesso!')
  } catch (err) {
    console.error('❌ Erro na migração:', err.message)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
