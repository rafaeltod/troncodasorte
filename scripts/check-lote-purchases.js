require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function main() {
  const rows = (await pool.query(
    'SELECT "userId", livros, numbers FROM livros WHERE "raffleId" = $1 ORDER BY livros ASC',
    ['3213f99c-b528-4887-9129-059e348338bb']
  )).rows;
  rows.forEach((r, i) => {
    const hasPrize = r.numbers.includes('647742');
    console.log('Compra ' + (i + 1) + ': livros=' + r.livros + ' | numbers=' + r.numbers + (hasPrize ? ' *** TEM PREMIO ***' : ''));
  });
  await pool.end();
}
main().catch(e => { console.error(e); process.exit(1); });
