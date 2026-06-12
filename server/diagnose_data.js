const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        console.log('--- DIAGNÓSTICO DO BANCO DE DADOS ---');
        const usersRes = await pool.query('SELECT id, nome, email FROM users');
        console.log(`Usuários no DB (${usersRes.rows.length}):`);
        for (const user of usersRes.rows) {
            const transCount = await pool.query('SELECT COUNT(*) FROM transactions WHERE user_id = $1', [user.id]);
            const catCount = await pool.query('SELECT COUNT(*) FROM categories WHERE user_id = $1', [user.id]);
            const cardCount = await pool.query('SELECT COUNT(*) FROM cards WHERE user_id = $1', [user.id]);
            console.log(`- ${user.nome} (${user.email}) [ID: ${user.id}]:`);
            console.log(`  * Transações: ${transCount.rows[0].count}`);
            console.log(`  * Categorias: ${catCount.rows[0].count}`);
            console.log(`  * Cartões: ${cardCount.rows[0].count}`);
        }
    } catch (err) {
        console.error('Erro no diagnóstico:', err);
    } finally {
        await pool.end();
    }
}

check();
