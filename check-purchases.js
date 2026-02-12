require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function checkPurchases() {
  try {
    const userId = '21a8a8a5-e76a-4fea-b9d2-33896585c9b3';
    
    console.log('\n=== BUSCANDO COMPRAS DO USUÁRIO ===\n');
    
    const result = await pool.query(
      `SELECT id, "raffleId", quotas, amount, status, "createdAt", "updatedAt" 
       FROM "rafflePurchase" 
       WHERE "userId" = $1 
       ORDER BY "createdAt" DESC 
       LIMIT 20`,
      [userId]
    );

    if (result.rows.length === 0) {
      console.log('❌ Nenhuma compra encontrada para este usuário\n');
      process.exit(0);
    }

    console.log(`✅ Encontradas ${result.rows.length} compras:\n`);
    
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. Compra ID: ${row.id}`);
      console.log(`   Rifa: ${row.raffleId}`);
      console.log(`   Cotas: ${row.quotas}`);
      console.log(`   Valor: R$ ${row.amount}`);
      console.log(`   Status: ${row.status}`);
      console.log(`   Criada em: ${new Date(row.createdAt).toLocaleString('pt-BR')}`);
      console.log(`   Atualizada em: ${new Date(row.updatedAt).toLocaleString('pt-BR')}`);
      console.log('');
    });

    // Contar por status
    const statusCount = {};
    result.rows.forEach(row => {
      statusCount[row.status] = (statusCount[row.status] || 0) + 1;
    });
    
    console.log('📊 RESUMO POR STATUS:');
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

  } catch (error) {
    console.error('Erro ao consultar:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkPurchases();
