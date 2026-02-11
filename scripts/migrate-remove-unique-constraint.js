// Migration script: Remove unique constraint on rafflePurchase table
// This allows users to make multiple purchases for the same raffle
import pkg from 'pg';
const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não encontrada! Configure a variável de ambiente.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function migrate() {
  console.log('🔄 Iniciando migração: Remover constraint unique de rafflePurchase...\n');

  try {
    // Check if constraint exists
    const checkConstraint = await pool.query(`
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = '"rafflePurchase"'::regclass
        AND conname = 'rafflePurchase_userId_raffleId_key';
    `);

    if (checkConstraint.rows.length === 0) {
      console.log('✅ Constraint já foi removida anteriormente. Nada a fazer.');
      return;
    }

    console.log('📋 Constraint encontrada:', checkConstraint.rows[0].conname);
    console.log('🗑️  Removendo constraint...\n');

    // Remove the unique constraint
    await pool.query(`
      ALTER TABLE "rafflePurchase" 
      DROP CONSTRAINT IF EXISTS "rafflePurchase_userId_raffleId_key";
    `);

    console.log('✅ Constraint removida com sucesso!');
    console.log('✨ Usuários agora podem fazer múltiplas compras para a mesma rifa.\n');

    // Verify removal
    const verifyConstraint = await pool.query(`
      SELECT conname, contype
      FROM pg_constraint
      WHERE conrelid = '"rafflePurchase"'::regclass;
    `);

    console.log('📊 Constraints restantes na tabela rafflePurchase:');
    if (verifyConstraint.rows.length === 0) {
      console.log('   (Nenhuma constraint além das chaves primárias e estrangeiras)');
    } else {
      verifyConstraint.rows.forEach(row => {
        const type = {
          'p': 'PRIMARY KEY',
          'f': 'FOREIGN KEY',
          'u': 'UNIQUE',
          'c': 'CHECK'
        }[row.contype] || row.contype;
        console.log(`   - ${row.conname} (${type})`);
      });
    }

  } catch (error) {
    console.error('❌ Erro durante a migração:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

migrate()
  .then(() => {
    console.log('\n✅ Migração concluída com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migração falhou:', error);
    process.exit(1);
  });
