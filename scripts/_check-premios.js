require("dotenv").config();
const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
pool.query(
  `SELECT "premiosConfig", "premiosAleatorios" FROM lotes WHERE id = $1`,
  ["9e16440a-1e28-4e46-9eab-267cd326e804"]
).then(r => {
  const row = r.rows[0];
  console.log("premiosConfig:", row.premiosConfig);
  console.log("premiosAleatorios:", row.premiosAleatorios);
}).finally(() => pool.end());
