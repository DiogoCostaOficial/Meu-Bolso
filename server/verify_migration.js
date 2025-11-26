const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function verifyMigration() {
    const client = await pool.connect();
    try {
        console.log('🔍 Verificando migração do banco de dados...\n');

        // 1. Verificar Usuários
        const resUsers = await client.query('SELECT COUNT(*) FROM users');
        console.log(`👥 Usuários encontrados: ${resUsers.rows[0].count}`);

        const users = await client.query('SELECT id, nome, email, tipo FROM users LIMIT 5');
        console.table(users.rows);

        // 2. Verificar Transações
        const resTrans = await client.query('SELECT COUNT(*) FROM transactions');
        console.log(`\n💰 Transações encontradas: ${resTrans.rows[0].count}`);

        const trans = await client.query('SELECT id, descricao, valor, tipo, user_id FROM transactions LIMIT 5');
        console.table(trans.rows);

        // 3. Verificar Categorias
        const resCats = await client.query('SELECT COUNT(*) FROM categories');
        console.log(`\n🏷️  Categorias encontradas: ${resCats.rows[0].count}`);

        const cats = await client.query('SELECT id, nome, tipo, user_id FROM categories LIMIT 5');
        console.table(cats.rows);

        // 4. Verificar Orçamentos
        const resBudgets = await client.query('SELECT COUNT(*) FROM budgets');
        console.log(`\n📊 Orçamentos encontrados: ${resBudgets.rows[0].count}`);

        const budgets = await client.query('SELECT id, categoria, valor_limite, user_id FROM budgets LIMIT 5');
        console.table(budgets.rows);

    } catch (err) {
        console.error('❌ Erro na verificação:', err);
    } finally {
        client.release();
        pool.end();
    }
}

verifyMigration();
