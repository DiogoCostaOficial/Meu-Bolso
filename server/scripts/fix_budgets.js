const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function fixBudgets() {
    const client = await pool.connect();
    try {
        console.log('🧹 Limpando orçamentos corrompidos...');

        // Delete rows where periodo is null or categoria is null
        const res = await client.query(`
            DELETE FROM budgets 
            WHERE periodo IS NULL OR categoria IS NULL
        `);

        console.log(`✅ ${res.rowCount} linhas corrompidas removidas.`);

        // Check remaining
        const remaining = await client.query('SELECT * FROM budgets');
        console.log(`📊 Orçamentos restantes: ${remaining.rowCount}`);
        remaining.rows.forEach(r => {
            console.log(`   - ${r.periodo} | ${r.categoria} | ${r.valor_limite}`);
        });

    } catch (err) {
        console.error('❌ Erro:', err);
    } finally {
        client.release();
        pool.end();
    }
}

fixBudgets();
