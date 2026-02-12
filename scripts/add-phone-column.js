require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    console.log('🔄 Adicionando coluna phone à tabela rafflePurchase...\n');
    
    // Verificar se coluna já existe
    const checkColumn = await pool.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = 'rafflePurchase' AND column_name = 'phone'`
    );
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ Coluna phone já existe');
      process.exit(0);
    }
    
    // Adicionar coluna
    await pool.query(
      `ALTER TABLE "rafflePurchase" ADD COLUMN phone VARCHAR(20)`
    );
    
    console.log('✅ Coluna phone adicionada com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
