const { Pool } = require('pg');
require('dotenv').config();

async function diagnosticarBancoDados() {
    console.log('\n🔍 DIAGNÓSTICO DO BANCO DE DADOS\n');
    console.log('='.repeat(60));

    // 1. Verificar variáveis de ambiente
    console.log('\n📋 1. VARIÁVEIS DE AMBIENTE:');
    console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurada' : '❌ NÃO configurada');
    console.log('   SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Configurada' : '❌ NÃO configurada');
    console.log('   SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ NÃO configurada');

    if (!process.env.DATABASE_URL) {
        console.log('\n❌ ERRO: DATABASE_URL não está configurada!');
        console.log('   Os dados não podem ser salvos sem conexão com o banco de dados.');
        console.log('   Configure o arquivo .env com as credenciais do Supabase.');
        return;
    }

    // 2. Testar conexão
    console.log('\n🔌 2. TESTANDO CONEXÃO COM O BANCO:');
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        const client = await pool.connect();
        console.log('   ✅ Conexão estabelecida com sucesso!');

        // 3. Verificar tabelas
        console.log('\n📊 3. VERIFICANDO TABELAS:');
        const tabelas = ['users', 'transactions', 'categories', 'budgets'];

        for (const tabela of tabelas) {
            try {
                const result = await client.query(`SELECT COUNT(*) FROM ${tabela}`);
                console.log(`   ✅ ${tabela}: ${result.rows[0].count} registros`);
            } catch (err) {
                console.log(`   ❌ ${tabela}: ERRO - ${err.message}`);
            }
        }

        // 4. Verificar índices e performance
        console.log('\n⚡ 4. VERIFICANDO PERFORMANCE:');
        try {
            const indexResult = await client.query(`
        SELECT 
          schemaname,
          tablename,
          indexname
        FROM pg_indexes
        WHERE schemaname = 'public'
        ORDER BY tablename, indexname
      `);
            console.log(`   ✅ ${indexResult.rows.length} índices encontrados`);
            indexResult.rows.forEach(idx => {
                console.log(`      - ${idx.tablename}.${idx.indexname}`);
            });
        } catch (err) {
            console.log(`   ⚠️  Não foi possível verificar índices: ${err.message}`);
        }

        // 5. Testar operação de escrita
        console.log('\n✍️  5. TESTANDO OPERAÇÃO DE ESCRITA:');
        const testId = `test-${Date.now()}`;
        const startTime = Date.now();

        try {
            await client.query('BEGIN');
            await client.query(`
        INSERT INTO categories (id, user_id, nome, tipo, subcategorias, cor, icone, is_custom)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [testId, 'test-user', 'Teste', 'despesa', [], '#000000', 'test', true]);

            await client.query('DELETE FROM categories WHERE id = $1', [testId]);
            await client.query('COMMIT');

            const duration = Date.now() - startTime;
            console.log(`   ✅ Operação de escrita bem-sucedida (${duration}ms)`);

            if (duration > 1000) {
                console.log('   ⚠️  ATENÇÃO: Operação demorou mais de 1 segundo!');
                console.log('      Possíveis causas:');
                console.log('      - Conexão lenta com o banco de dados');
                console.log('      - Banco de dados sobrecarregado');
                console.log('      - Falta de índices nas tabelas');
            }
        } catch (err) {
            await client.query('ROLLBACK');
            console.log(`   ❌ ERRO na operação de escrita: ${err.message}`);
        }

        // 6. Verificar conexões ativas
        console.log('\n🔗 6. CONEXÕES ATIVAS:');
        try {
            const connResult = await client.query(`
        SELECT count(*) as total
        FROM pg_stat_activity
        WHERE datname = current_database()
      `);
            console.log(`   Total de conexões: ${connResult.rows[0].total}`);

            if (parseInt(connResult.rows[0].total) > 10) {
                console.log('   ⚠️  ATENÇÃO: Muitas conexões ativas!');
                console.log('      Isso pode causar lentidão. Considere usar connection pooling.');
            }
        } catch (err) {
            console.log(`   ⚠️  Não foi possível verificar conexões: ${err.message}`);
        }

        client.release();

    } catch (err) {
        console.log(`   ❌ ERRO ao conectar: ${err.message}`);
        console.log('\n   Possíveis causas:');
        console.log('   - DATABASE_URL incorreta');
        console.log('   - Firewall bloqueando a conexão');
        console.log('   - Banco de dados offline');
    } finally {
        await pool.end();
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n💡 RESUMO:');
    console.log('   Onde os dados são salvos: Banco de dados PostgreSQL (Supabase)');
    console.log('   Localização: Nuvem (não no seu computador)');
    console.log('   Acesso: Via DATABASE_URL configurada no arquivo .env');
    console.log('\n');
}

diagnosticarBancoDados().catch(console.error);
