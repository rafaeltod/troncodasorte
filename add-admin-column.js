const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

async function addAdminColumn() {
  const client = await pool.connect()
  try {
    console.log('Adicionando coluna isAdmin à tabela user...')
    await client.query('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN DEFAULT FALSE')
    console.log('✓ Coluna isAdmin adicionada com sucesso!')
  } catch (error) {
    console.error('Erro:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

addAdminColumn()
