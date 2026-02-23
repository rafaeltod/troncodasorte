require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  const client = await pool.connect();
  try {
    // Adiciona coluna qtdPremiosAleatorios (quantidade de prêmios aleatórios definida na criação)
    await client.query(`
      ALTER TABLE lotes ADD COLUMN IF NOT EXISTS "qtdPremiosAleatorios" INTEGER DEFAULT 0;
    `);
    console.log('✅ Coluna qtdPremiosAleatorios adicionada');

    // Adiciona coluna premiosAleatorios (JSON com os prêmios sorteados)
    await client.query(`
      ALTER TABLE lotes ADD COLUMN IF NOT EXISTS "premiosAleatorios" TEXT;
    `);
    console.log('✅ Coluna premiosAleatorios adicionada');

    console.log('🎉 Migração concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
