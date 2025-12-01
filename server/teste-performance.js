const { Pool } = require('pg');
require('dotenv').config();

async function testarPerformanceSalvamento() {
    console.log('\n⚡ TESTE DE PERFORMANCE - SALVAMENTO DE DADOS\n');
    console.log('='.repeat(60));

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    // Variáveis para armazenar tempos
    let readDuration = 0;
    let writeDuration = 0;
    let fullDuration = 0;

    try {
        const client = await pool.connect();
        console.log('✅ Conectado ao banco de dados\n');

        // Buscar um usuário real para teste
        const usersResult = await client.query('SELECT id FROM users LIMIT 1');
        if (usersResult.rows.length === 0) {
            console.log('❌ Nenhum usuário encontrado no banco de dados');
            client.release();
            await pool.end();
            return;
        }

        const userId = usersResult.rows[0].id;
        console.log(`📋 Testando com usuário: ${userId}\n`);

        // Teste 1: Buscar dados (READ)
        console.log('1️⃣  TESTE DE LEITURA:');
        const readStart = Date.now();

        const receitasRes = await client.query("SELECT * FROM transactions WHERE user_id = $1 AND tipo = 'receita'", [userId]);
        const despesasRes = await client.query("SELECT * FROM transactions WHERE user_id = $1 AND tipo = 'despesa'", [userId]);
        const categoriasRes = await client.query("SELECT * FROM categories WHERE user_id = $1", [userId]);
        const orcamentosRes = await client.query("SELECT * FROM budgets WHERE user_id = $1", [userId]);

        readDuration = Date.now() - readStart;
        console.log(`   ✅ Leitura concluída em ${readDuration}ms`);
        console.log(`   📊 Dados encontrados:`);
        console.log(`      - Receitas: ${receitasRes.rows.length}`);
        console.log(`      - Despesas: ${despesasRes.rows.length}`);
        console.log(`      - Categorias: ${categoriasRes.rows.length}`);
        console.log(`      - Orçamentos: ${orcamentosRes.rows.length}`);

        if (readDuration > 1000) {
            console.log(`   ⚠️  LENTO: A leitura demorou mais de 1 segundo!`);
        }

        // Teste 2: Salvar dados (WRITE)
        console.log('\n2️⃣  TESTE DE ESCRITA:');
        const writeStart = Date.now();

        try {
            await client.query('BEGIN');

            // Simular salvamento de uma receita
            const testId = `test-perf-${Date.now()}`;
            await client.query(`
        INSERT INTO transactions (id, user_id, descricao, valor, data, categoria, subcategoria, tipo, status, status_pagamento, parcelado, parcelas_total, parcela_atual, observacao)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'receita', $8, $9, $10, $11, $12, $13)
      `, [testId, userId, 'Teste Performance', 100, '2025-11-28', 'Salário', '', 'confirmado', 'recebido', false, 1, 1, 'Teste de performance']);

            // Deletar o registro de teste
            await client.query('DELETE FROM transactions WHERE id = $1', [testId]);

            await client.query('COMMIT');

            writeDuration = Date.now() - writeStart;
            console.log(`   ✅ Escrita concluída em ${writeDuration}ms`);

            if (writeDuration > 2000) {
                console.log(`   ⚠️  MUITO LENTO: A escrita demorou mais de 2 segundos!`);
            } else if (writeDuration > 1000) {
                console.log(`   ⚠️  LENTO: A escrita demorou mais de 1 segundo`);
            }

        } catch (err) {
            await client.query('ROLLBACK');
            console.log(`   ❌ ERRO: ${err.message}`);
            writeDuration = Date.now() - writeStart;
        }

        // Teste 3: Operação completa (DELETE + INSERT múltiplos)
        console.log('\n3️⃣  TESTE DE OPERAÇÃO COMPLETA (como salvarDadosUsuario):');
        const fullStart = Date.now();

        try {
            await client.query('BEGIN');

            // Contar registros antes
            const countBefore = await client.query("SELECT COUNT(*) FROM transactions WHERE user_id = $1", [userId]);
            console.log(`   📊 Registros antes: ${countBefore.rows[0].count}`);

            // DELETE (simula limpeza)
            const deleteStart = Date.now();
            await client.query('DELETE FROM transactions WHERE user_id = $1 AND id LIKE $2', [userId, 'test-full-%']);
            const deleteTime = Date.now() - deleteStart;
            console.log(`   🗑️  DELETE executado em ${deleteTime}ms`);

            // INSERT múltiplos (simula salvamento)
            const insertStart = Date.now();
            for (let i = 0; i < 10; i++) {
                const testId = `test-full-${Date.now()}-${i}`;
                await client.query(`
          INSERT INTO transactions (id, user_id, descricao, valor, data, categoria, subcategoria, tipo, status, status_pagamento, parcelado, parcelas_total, parcela_atual, observacao)
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'receita', $8, $9, $10, $11, $12, $13)
        `, [testId, userId, `Teste ${i}`, 100, '2025-11-28', 'Salário', '', 'confirmado', 'recebido', false, 1, 1, '']);
            }
            const insertTime = Date.now() - insertStart;
            console.log(`   ➕ INSERT de 10 registros em ${insertTime}ms (média: ${(insertTime / 10).toFixed(1)}ms/registro)`);

            // Limpar testes
            await client.query('DELETE FROM transactions WHERE user_id = $1 AND id LIKE $2', [userId, 'test-full-%']);

            await client.query('COMMIT');

            fullDuration = Date.now() - fullStart;
            console.log(`   ✅ Operação completa em ${fullDuration}ms`);

            if (fullDuration > 5000) {
                console.log(`   ❌ CRÍTICO: Operação muito lenta! (>5s)`);
            } else if (fullDuration > 3000) {
                console.log(`   ⚠️  ATENÇÃO: Operação lenta (>3s)`);
            }

        } catch (err) {
            await client.query('ROLLBACK');
            console.log(`   ❌ ERRO: ${err.message}`);
            fullDuration = Date.now() - fullStart;
        }

        // Análise de problemas
        console.log('\n' + '='.repeat(60));
        console.log('\n💡 ANÁLISE E RECOMENDAÇÕES:\n');

        if (readDuration > 1000 || writeDuration > 2000) {
            console.log('⚠️  PROBLEMAS DE PERFORMANCE DETECTADOS:\n');
            console.log('Possíveis causas:');
            console.log('1. 🌐 Latência de rede alta (conexão com Supabase)');
            console.log('2. 📊 Muitos registros no banco de dados');
            console.log('3. 🔗 Muitas conexões simultâneas');
            console.log('4. 💾 Falta de índices adequados');
            console.log('\nSoluções recomendadas:');
            console.log('✅ Implementar debouncing no frontend (aguardar 500ms antes de salvar)');
            console.log('✅ Usar indicador de "salvando..." para feedback ao usuário');
            console.log('✅ Considerar salvamento em lote (batch)');
            console.log('✅ Adicionar mais índices nas tabelas');
            console.log('✅ Implementar cache local (localStorage) com sincronização');
        } else {
            console.log('✅ Performance está dentro do esperado!');
        }

        console.log('\n');

        client.release();

    } catch (err) {
        console.log(`❌ ERRO GERAL: ${err.message}`);
    } finally {
        await pool.end();
    }
}

testarPerformanceSalvamento().catch(console.error);
