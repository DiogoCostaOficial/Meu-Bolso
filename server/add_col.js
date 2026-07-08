require('dotenv').config();
const { Pool } = require('pg');

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const res = await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS ultimo_acesso TIMESTAMP WITH TIME ZONE;
    `);
    console.log("Column ultimo_acesso exists or was added!");
    
    const columns = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
    console.log("Columns in users table:");
    columns.rows.forEach(r => console.log("- " + r.column_name));
    
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

main();
