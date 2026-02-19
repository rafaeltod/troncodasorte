require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function migrate() {
  const client = await pool.connect()
  try {
    // Adiciona coluna drawnNumber (número digitado pelo admin)
    await client.query(`
      ALTER TABLE lotes ADD COLUMN IF NOT EXISTS "drawnNumber" VARCHAR(6);
    `)
    console.log('✅ Coluna drawnNumber adicionada')

    // Adiciona coluna winnerNumber (número que realmente correspondeu)
    await client.query(`
      ALTER TABLE lotes ADD COLUMN IF NOT EXISTS "winnerNumber" VARCHAR(6);
    `)
    console.log('✅ Coluna winnerNumber adicionada')

    console.log('🎉 Migração concluída com sucesso!')
  } catch (error) {
    console.error('❌ Erro na migração:', error)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
