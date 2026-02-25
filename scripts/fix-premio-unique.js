require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function main() {
  // Números já usados (todos os existentes)
  const usedNumbers = new Set(['647742','340323','920162','151371','519683','864662','453664','080418','323891','360783','623169','731180','708690','630163','830551']);

  function gen() {
    while (true) {
      const n = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
      if (!usedNumbers.has(n)) { usedNumbers.add(n); return n; }
    }
  }

  // Compra 2 (4 livros) - remover 647742
  const new2 = [gen(), '151371', '519683', '864662'].join(',');
  await pool.query('UPDATE livros SET numbers = $1 WHERE id = $2', [new2, '850daccd-cbf5-44a9-bfdc-d04659e99649']);
  console.log('Compra 2 atualizada:', new2);

  // Compra 3 (5 livros) - remover 647742
  const new3 = [gen(), '453664', '080418', '323891', '360783'].join(',');
  await pool.query('UPDATE livros SET numbers = $1 WHERE id = $2', [new3, 'cfc8cb45-bac8-49a8-abb1-2eb6096f5383']);
  console.log('Compra 3 atualizada:', new3);

  // Compra 4 (6 livros) - remover 647742
  const new4 = [gen(), '623169', '731180', '708690', '630163', '830551'].join(',');
  await pool.query('UPDATE livros SET numbers = $1 WHERE id = $2', [new4, '5c9c537d-5985-4811-a39a-b6647e0a31b9']);
  console.log('Compra 4 atualizada:', new4);

  // Verificar resultado final
  const rows = (await pool.query(
    'SELECT "userId", livros, numbers FROM livros WHERE "raffleId" = $1 ORDER BY livros ASC',
    ['3213f99c-b528-4887-9129-059e348338bb']
  )).rows;
  console.log('\n--- RESULTADO FINAL ---');
  rows.forEach((r, i) => {
    const hasPrize = r.numbers.includes('647742');
    console.log('Compra ' + (i + 1) + ': livros=' + r.livros + ' | numbers=' + r.numbers + (hasPrize ? ' *** TEM PREMIO ***' : ''));
  });

  console.log('\nDone!');
  await pool.end();
}
main().catch(e => { console.error(e); process.exit(1); });
