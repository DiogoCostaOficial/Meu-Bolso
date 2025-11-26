const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function debugUserData() {
    const client = await pool.connect();
    try {
        console.log('🔍 Investigando dados do usuário...\n');

        const email = 'diogo.grunge@gmail.com';

        // 1. Buscar ID do usuário
        const userRes = await client.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userRes.rows.length === 0) {
            console.log(`❌ Usuário ${email} NÃO encontrado no banco de dados!`);
            return;
        }

        const user = userRes.rows[0];
        console.log(`✅ Usuário encontrado:`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Nome: ${user.nome}`);
        console.log(`   Email: ${user.email}`);

        // 2. Buscar Transações
        const transRes = await client.query('SELECT COUNT(*) as count, tipo FROM transactions WHERE user_id = $1 GROUP BY tipo', [user.id]);

        console.log(`\n📊 Transações no Banco:`);
        if (transRes.rows.length === 0) {
            console.log(`   ⚠️ Nenhuma transação encontrada para este ID.`);
        } else {
            transRes.rows.forEach(row => {
                console.log(`   - ${row.tipo}: ${row.count}`);
            });
        }

        // 3. Listar algumas transações para conferência
        const sampleTrans = await client.query('SELECT * FROM transactions WHERE user_id = $1 LIMIT 3', [user.id]);
        if (sampleTrans.rows.length > 0) {
            console.log(`\n📝 Exemplo de transações:`);
            sampleTrans.rows.forEach(t => {
                console.log(`   - [${t.tipo}] ${t.descricao}: R$ ${t.valor} (ID: ${t.id})`);
            });
        }

    } catch (err) {
        console.error('❌ Erro no debug:', err);
    } finally {
        client.release();
        pool.end();
    }
}

debugUserData();
