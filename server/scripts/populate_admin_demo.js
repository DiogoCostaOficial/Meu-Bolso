const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function populateAdminDemo() {
    const client = await pool.connect();
    try {
        console.log('🎨 Populando dados de demonstração para o admin...\n');

        // 1. Buscar ID do admin
        const adminRes = await client.query("SELECT * FROM users WHERE email = 'admin@admin.com'");

        if (adminRes.rows.length === 0) {
            console.log('❌ Usuário admin não encontrado!');
            return;
        }

        const adminId = adminRes.rows[0].id;
        console.log(`✅ Admin encontrado: ${adminId}\n`);

        // 2. Limpar dados existentes do admin
        await client.query('DELETE FROM transactions WHERE user_id = $1', [adminId]);
        await client.query('DELETE FROM budgets WHERE user_id = $1', [adminId]);
        console.log('🧹 Dados antigos removidos\n');

        // 3. Criar categorias personalizadas
        const categorias = [
            { nome: 'Despesas Fixas', cor: '#EF4444', subcategorias: ['Aluguel', 'Condomínio', 'Internet', 'Luz', 'Água', 'Telefone'] },
            { nome: 'Alimentação', cor: '#F59E0B', subcategorias: ['Supermercado', 'Restaurante', 'Delivery', 'Padaria'] },
            { nome: 'Transporte', cor: '#3B82F6', subcategorias: ['Combustível', 'Uber', 'Manutenção', 'IPVA', 'Seguro'] },
            { nome: 'Saúde', cor: '#10B981', subcategorias: ['Plano de Saúde', 'Farmácia', 'Consultas', 'Academia'] },
            { nome: 'Lazer', cor: '#8B5CF6', subcategorias: ['Cinema', 'Streaming', 'Viagens', 'Hobbies'] },
            { nome: 'Educação', cor: '#EC4899', subcategorias: ['Cursos', 'Livros', 'Material'] },
            { nome: 'Investimentos', cor: '#14B8A6', subcategorias: ['Ações', 'Renda Fixa', 'Criptomoedas'] },
            { nome: 'Outros', cor: '#6B7280', subcategorias: ['Presentes', 'Doações', 'Diversos'] }
        ];

        // 4. Criar RECEITAS (últimos 12 meses)
        const receitas = [];
        const anoAtual = new Date().getFullYear();
        const mesAtual = new Date().getMonth() + 1;

        for (let i = 0; i < 12; i++) {
            let mes = mesAtual - i;
            let ano = anoAtual;

            if (mes <= 0) {
                mes += 12;
                ano -= 1;
            }

            const mesStr = mes.toString().padStart(2, '0');
            const dataBase = `${ano}-${mesStr}-05`;

            // Salário mensal
            receitas.push({
                id: `receita-salario-${ano}-${mesStr}`,
                descricao: 'Salário',
                valor: 7500.00,
                data: dataBase,
                categoria: 'Salário',
                subcategoria: 'CLT',
                status: 'Recebida',
                statusPagamento: 'Pago',
                parcelado: false,
                parcelas: null,
                parcelaAtual: null,
                observacao: 'Salário mensal'
            });

            // Receitas extras aleatórias
            if (Math.random() > 0.5) {
                receitas.push({
                    id: `receita-extra-${ano}-${mesStr}`,
                    descricao: 'Freelance',
                    valor: Math.floor(Math.random() * 2000) + 500,
                    data: `${ano}-${mesStr}-${Math.floor(Math.random() * 20) + 10}`,
                    categoria: 'Freelance',
                    subcategoria: 'Projetos',
                    status: 'Recebida',
                    statusPagamento: 'Pago',
                    parcelado: false,
                    parcelas: null,
                    parcelaAtual: null,
                    observacao: 'Trabalho extra'
                });
            }
        }

        // 5. Criar DESPESAS variadas
        const despesas = [];
        const despesasFixas = [
            { descricao: 'Aluguel', categoria: 'Despesas Fixas', subcategoria: 'Aluguel', valor: 1800 },
            { descricao: 'Condomínio', categoria: 'Despesas Fixas', subcategoria: 'Condomínio', valor: 350 },
            { descricao: 'Internet', categoria: 'Despesas Fixas', subcategoria: 'Internet', valor: 120 },
            { descricao: 'Luz', categoria: 'Despesas Fixas', subcategoria: 'Luz', valor: 180 },
            { descricao: 'Água', categoria: 'Despesas Fixas', subcategoria: 'Água', valor: 80 },
            { descricao: 'Plano de Saúde', categoria: 'Saúde', subcategoria: 'Plano de Saúde', valor: 450 },
            { descricao: 'Academia', categoria: 'Saúde', subcategoria: 'Academia', valor: 150 },
            { descricao: 'Netflix', categoria: 'Lazer', subcategoria: 'Streaming', valor: 45 },
            { descricao: 'Spotify', categoria: 'Lazer', subcategoria: 'Streaming', valor: 25 }
        ];

        const despesasVariaveis = [
            { descricao: 'Supermercado', categoria: 'Alimentação', subcategoria: 'Supermercado', valorMin: 400, valorMax: 800 },
            { descricao: 'Restaurante', categoria: 'Alimentação', subcategoria: 'Restaurante', valorMin: 100, valorMax: 400 },
            { descricao: 'Combustível', categoria: 'Transporte', subcategoria: 'Combustível', valorMin: 200, valorMax: 500 },
            { descricao: 'Uber', categoria: 'Transporte', subcategoria: 'Uber', valorMin: 50, valorMax: 200 },
            { descricao: 'Farmácia', categoria: 'Saúde', subcategoria: 'Farmácia', valorMin: 50, valorMax: 200 },
            { descricao: 'Cinema', categoria: 'Lazer', subcategoria: 'Cinema', valorMin: 40, valorMax: 120 },
            { descricao: 'Livros', categoria: 'Educação', subcategoria: 'Livros', valorMin: 30, valorMax: 150 },
            { descricao: 'Investimento Mensal', categoria: 'Investimentos', subcategoria: 'Renda Fixa', valorMin: 500, valorMax: 1000 }
        ];

        for (let i = 0; i < 12; i++) {
            let mes = mesAtual - i;
            let ano = anoAtual;

            if (mes <= 0) {
                mes += 12;
                ano -= 1;
            }

            const mesStr = mes.toString().padStart(2, '0');

            // Despesas fixas
            despesasFixas.forEach((desp, idx) => {
                const dia = Math.floor(Math.random() * 28) + 1;
                despesas.push({
                    id: `despesa-fixa-${ano}-${mesStr}-${idx}`,
                    descricao: desp.descricao,
                    valor: desp.valor,
                    data: `${ano}-${mesStr}-${dia.toString().padStart(2, '0')}`,
                    categoria: desp.categoria,
                    subcategoria: desp.subcategoria,
                    status: 'Paga',
                    statusPagamento: 'Pago',
                    parcelado: false,
                    parcelas: null,
                    parcelaAtual: null,
                    observacao: 'Despesa fixa mensal'
                });
            });

            // Despesas variáveis
            despesasVariaveis.forEach((desp, idx) => {
                const quantidade = Math.floor(Math.random() * 3) + 1; // 1 a 3 vezes por mês
                for (let q = 0; q < quantidade; q++) {
                    const dia = Math.floor(Math.random() * 28) + 1;
                    const valor = Math.floor(Math.random() * (desp.valorMax - desp.valorMin)) + desp.valorMin;
                    despesas.push({
                        id: `despesa-var-${ano}-${mesStr}-${idx}-${q}`,
                        descricao: desp.descricao,
                        valor: valor,
                        data: `${ano}-${mesStr}-${dia.toString().padStart(2, '0')}`,
                        categoria: desp.categoria,
                        subcategoria: desp.subcategoria,
                        status: 'Paga',
                        statusPagamento: 'Pago',
                        parcelado: false,
                        parcelas: null,
                        parcelaAtual: null,
                        observacao: ''
                    });
                }
            });
        }

        // 6. Inserir receitas
        console.log(`📥 Inserindo ${receitas.length} receitas...`);
        for (const r of receitas) {
            await client.query(`
                INSERT INTO transactions (id, user_id, descricao, valor, data, categoria, subcategoria, tipo, status, status_pagamento, parcelado, parcelas_total, parcela_atual, observacao)
                VALUES ($1, $2, $3, $4, $5, $6, $7, 'receita', $8, $9, $10, $11, $12, $13)
            `, [r.id, adminId, r.descricao, r.valor, r.data, r.categoria, r.subcategoria, r.status, r.statusPagamento, r.parcelado, r.parcelas, r.parcelaAtual, r.observacao]);
        }

        // 7. Inserir despesas
        console.log(`📤 Inserindo ${despesas.length} despesas...`);
        for (const d of despesas) {
            await client.query(`
                INSERT INTO transactions (id, user_id, descricao, valor, data, categoria, subcategoria, tipo, status, status_pagamento, parcelado, parcelas_total, parcela_atual, observacao)
                VALUES ($1, $2, $3, $4, $5, $6, $7, 'despesa', $8, $9, $10, $11, $12, $13)
            `, [d.id, adminId, d.descricao, d.valor, d.data, d.categoria, d.subcategoria, d.status, d.statusPagamento, d.parcelado, d.parcelas, d.parcelaAtual, d.observacao]);
        }

        // 8. Criar orçamento para o mês atual
        const mesAtualStr = mesAtual.toString().padStart(2, '0');
        const periodoOrcamento = `${anoAtual}-${mesAtualStr}`;

        console.log(`💰 Criando orçamento para ${periodoOrcamento}...`);

        const orcamentoCategorias = [
            { nome: 'Despesas Fixas', percentual: 30, valor: 2250 },
            { nome: 'Alimentação', percentual: 20, valor: 1500 },
            { nome: 'Transporte', percentual: 10, valor: 750 },
            { nome: 'Saúde', percentual: 10, valor: 750 },
            { nome: 'Lazer', percentual: 8, valor: 600 },
            { nome: 'Educação', percentual: 5, valor: 375 },
            { nome: 'Investimentos', percentual: 15, valor: 1125 },
            { nome: 'Outros', percentual: 2, valor: 150 }
        ];

        // Meta dados
        const metaItems = [
            { key: 'META_RENDA_PREVISTA', value: 7500 },
            { key: 'META_DIVIDAS', value: 0 },
            { key: 'META_RENDA_REAL', value: 7500 }
        ];

        for (const item of metaItems) {
            const metaId = `budget-meta-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
            await client.query(`
                INSERT INTO budgets (id, user_id, categoria, valor_limite, periodo)
                VALUES ($1, $2, $3, $4, $5)
            `, [metaId, adminId, item.key, item.value, periodoOrcamento]);
        }

        // Categorias do orçamento
        for (const cat of orcamentoCategorias) {
            const catId = `budget-cat-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
            await client.query(`
                INSERT INTO budgets (id, user_id, categoria, valor_limite, periodo)
                VALUES ($1, $2, $3, $4, $5)
            `, [catId, adminId, cat.nome, cat.valor, periodoOrcamento]);
        }

        console.log('\n✅ Dados de demonstração criados com sucesso!');
        console.log(`📊 Total de receitas: ${receitas.length}`);
        console.log(`📊 Total de despesas: ${despesas.length}`);
        console.log(`💰 Orçamento mensal: R$ 7.500,00`);
        console.log(`📅 Período do orçamento: ${periodoOrcamento}`);

    } catch (err) {
        console.error('❌ Erro:', err);
    } finally {
        client.release();
        pool.end();
    }
}

populateAdminDemo();
