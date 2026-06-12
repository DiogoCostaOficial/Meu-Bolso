const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const inicializarDB = async () => {
    try {
        const client = await pool.connect();
        console.log('✅ Conectado ao Supabase Postgres');
        client.release();
    } catch (err) {
        console.error('Erro ao conectar ao DB:', err);
    }
};

const getUsuarios = async () => {
    try {
        const res = await pool.query('SELECT * FROM users');
        return res.rows.map(u => ({
            id: u.id,
            nome: u.nome,
            email: u.email,
            senha: u.senha,
            tipo: u.tipo,
            avatar: u.avatar,
            verificado: u.verificado,
            primeiroAcesso: u.primeiro_acesso,
            otpCodigo: u.otp_codigo,
            otpExpira: u.otp_expiracao ? u.otp_expiracao.toISOString() : null,
            ativo: true
        }));
    } catch (err) {
        console.error('Erro ao buscar usuários:', err);
        return [];
    }
};

const adicionarUsuario = async (usuario) => {
    try {
        await pool.query(`
      INSERT INTO users (id, nome, email, senha, tipo, avatar, verificado, primeiro_acesso, otp_codigo, otp_expiracao)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [usuario.id, usuario.nome, usuario.email, usuario.senha, usuario.tipo, usuario.avatar, usuario.verificado, usuario.primeiroAcesso, usuario.otpCodigo, usuario.otpExpira]);
        return true;
    } catch (err) {
        console.error('Erro ao adicionar usuário:', err);
        return false;
    }
};

const atualizarUsuario = async (usuario) => {
    try {
        await pool.query(`
      UPDATE users SET
        nome = $1,
        email = $2,
        senha = $3,
        avatar = $4,
        verificado = $5,
        primeiro_acesso = $6,
        otp_codigo = $7,
        otp_expiracao = $8
      WHERE id = $9
    `, [usuario.nome, usuario.email, usuario.senha, usuario.avatar, usuario.verificado, usuario.primeiroAcesso, usuario.otpCodigo, usuario.otpExpira, usuario.id]);
        return true;
    } catch (err) {
        console.error('Erro ao atualizar usuário:', err);
        return false;
    }
};

const buscarDadosUsuario = async (userId) => {
    const client = await pool.connect();
    try {
        const receitasRes = await client.query("SELECT * FROM transactions WHERE user_id = $1 AND tipo = 'receita'", [userId]);
        const despesasRes = await client.query("SELECT * FROM transactions WHERE user_id = $1 AND tipo = 'despesa'", [userId]);
        const categoriasRes = await client.query("SELECT * FROM categories WHERE user_id = $1", [userId]);
        const orcamentosRes = await client.query("SELECT * FROM budgets WHERE user_id = $1", [userId]);
        const cartoesRes = await client.query("SELECT * FROM cards WHERE user_id = $1", [userId]);

        // Reconstruct Budgets from flat SQL rows
        const rawBudgets = orcamentosRes.rows;
        const budgetsByMonth = {};

        // Create a map of category colors
        const categoryColors = {};
        categoriasRes.rows.forEach(c => {
            categoryColors[c.nome] = c.cor;
        });

        rawBudgets.forEach(row => {
            if (!row.periodo) return;

            if (!budgetsByMonth[row.periodo]) {
                budgetsByMonth[row.periodo] = {
                    mes: row.periodo,
                    rendaPrevista: 0,
                    dividas: 0,
                    rendaReal: 0,
                    categorias: []
                };
            }

            const monthData = budgetsByMonth[row.periodo];
            const valor = parseFloat(row.valor_limite);

            if (row.categoria === 'META_RENDA_PREVISTA') {
                monthData.rendaPrevista = valor;
            } else if (row.categoria === 'META_DIVIDAS') {
                monthData.dividas = valor;
            } else if (row.categoria === 'META_RENDA_REAL') {
                monthData.rendaReal = valor;
            } else {
                // Regular category
                monthData.categorias.push({
                    nome: row.categoria,
                    valorPlanejado: valor,
                    // Percentual will be calculated below
                    percentual: 0,
                    cor: categoryColors[row.categoria] || '#CCCCCC' // Use mapped color or default
                });
            }
        });

        // Calculate percentages and finalize structure
        const finalOrcamentos = Object.values(budgetsByMonth).map(orc => {
            if (orc.rendaReal > 0) {
                orc.categorias = orc.categorias.map(cat => ({
                    ...cat,
                    percentual: parseFloat(((cat.valorPlanejado / orc.rendaReal) * 100).toFixed(2))
                }));
            }
            return orc;
        });

        return {
            receitas: receitasRes.rows.map(r => ({
                id: r.id,
                descricao: r.descricao,
                valor: parseFloat(r.valor),
                data: r.data instanceof Date ? r.data.toISOString().split('T')[0] : r.data,
                dataCompra: r.data_compra instanceof Date ? r.data_compra.toISOString().split('T')[0] : r.data_compra,
                categoria: r.categoria,
                subcategoria: r.subcategoria,
                status: r.status,
                statusPagamento: r.status_pagamento,
                parcelado: r.parcelado,
                parcelas: r.parcelas_total,
                parcelaAtual: r.parcela_atual,
                observacao: r.observacao
            })),
            despesas: despesasRes.rows.map(r => {
                const dataVenc = r.data_vencimento instanceof Date ? r.data_vencimento.toISOString().split('T')[0] : r.data_vencimento;
                const dataDesp = r.data instanceof Date ? r.data.toISOString().split('T')[0] : r.data;
                return {
                    id: r.id,
                    descricao: r.descricao,
                    valor: parseFloat(r.valor),
                    data: dataVenc || dataDesp, // Prioritize due date for organization/reports
                    dataLancamento: dataDesp, // launch/expense date
                    dataCompra: r.data_compra instanceof Date ? r.data_compra.toISOString().split('T')[0] : r.data_compra,
                    categoria: r.categoria,
                    subcategoria: r.subcategoria,
                    status: r.status,
                    statusPagamento: r.status_pagamento,
                    parcelado: r.parcelado,
                    parcelas: r.parcelas_total,
                    parcelaAtual: r.parcela_atual,
                    observacao: r.observacao,
                    dataVencimento: dataVenc || ''
                };
            }),
            categorias: categoriasRes.rows.map(c => ({
                id: c.id,
                nome: c.nome,
                tipo: c.tipo,
                subcategorias: c.subcategorias,
                cor: c.cor,
                icone: c.icone
            })),
            orcamentos: finalOrcamentos,
            cartoes: cartoesRes.rows.map(c => ({
                id: c.id,
                nome: c.nome,
                valores: typeof c.valores === 'string' ? JSON.parse(c.valores) : (c.valores || {})
            }))
        };
    } catch (err) {
        console.error('Erro ao buscar dados do usuário:', err);
        return { receitas: [], despesas: [], categorias: [], orcamentos: [], cartoes: [] };
    } finally {
        client.release();
    }
};

const salvarDadosUsuario = async (userId, dados) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // =========================================================================
        // 1. TRANSAÇÕES (RECEITAS E DESPESAS) - BATCH UPSERT
        // =========================================================================

        const incomingTransactions = [];

        // 1.1 TRATAMENTO DE RECEITAS
        if (dados.receitas && Array.isArray(dados.receitas)) {
            const receitaIds = dados.receitas.map(r => r.id).filter(id => id);
            if (receitaIds.length > 0) {
                await client.query(`
          DELETE FROM transactions 
          WHERE user_id = $1 AND tipo = 'receita' AND id NOT IN (SELECT unnest($2::text[]))
        `, [userId, receitaIds]);
            } else {
                await client.query(`DELETE FROM transactions WHERE user_id = $1 AND tipo = 'receita'`, [userId]);
            }
            dados.receitas.forEach(r => incomingTransactions.push({ ...r, tipo: 'receita' }));
        }

        // 1.2 TRATAMENTO DE DESPESAS
        if (dados.despesas && Array.isArray(dados.despesas)) {
            const despesaIds = dados.despesas.map(d => d.id).filter(id => id);
            if (despesaIds.length > 0) {
                await client.query(`
          DELETE FROM transactions 
          WHERE user_id = $1 AND tipo = 'despesa' AND id NOT IN (SELECT unnest($2::text[]))
        `, [userId, despesaIds]);
            } else {
                await client.query(`DELETE FROM transactions WHERE user_id = $1 AND tipo = 'despesa'`, [userId]);
            }
            dados.despesas.forEach(d => incomingTransactions.push({ ...d, tipo: 'despesa' }));
        }

        // 1.3 BATCH INSERT/UPDATE TRANSACTIONS
        if (incomingTransactions.length > 0) {
            const tIds = incomingTransactions.map(t => t.id);
            const tUserIds = incomingTransactions.map(() => userId);
            const tDescs = incomingTransactions.map(t => t.descricao);
            const tVals = incomingTransactions.map(t => t.valor);
            const tDatas = incomingTransactions.map(t => t.dataLancamento || t.data);
            const tDatasCompra = incomingTransactions.map(t => t.dataCompra || null);
            const tDatasVencimento = incomingTransactions.map(t => t.dataVencimento || null);
            const tCats = incomingTransactions.map(t => t.categoria);
            const tSubcats = incomingTransactions.map(t => t.subcategoria);
            const tTipos = incomingTransactions.map(t => t.tipo);
            const tStatus = incomingTransactions.map(t => t.status);
            const tStatusPg = incomingTransactions.map(t => t.statusPagamento);
            const tParcelado = incomingTransactions.map(t => t.parcelado);
            const tParcelas = incomingTransactions.map(t => t.parcelas || t.parcelas_total);
            const tParcelaAtual = incomingTransactions.map(t => t.parcelaAtual || t.parcela_atual);
            const tObs = incomingTransactions.map(t => t.observacao);

            await client.query(`
        INSERT INTO transactions (
          id, user_id, descricao, valor, data, data_compra, data_vencimento, categoria, subcategoria, 
          tipo, status, status_pagamento, parcelado, parcelas_total, 
          parcela_atual, observacao
        )
        SELECT * FROM UNNEST(
          $1::text[], $2::text[], $3::text[], $4::numeric[], $5::date[], $6::date[], $7::date[], $8::text[], $9::text[],
          $10::text[], $11::text[], $12::text[], $13::boolean[], $14::integer[],
          $15::integer[], $16::text[]
        )
        ON CONFLICT (id) DO UPDATE SET
          descricao = EXCLUDED.descricao,
          valor = EXCLUDED.valor,
          data = EXCLUDED.data,
          data_compra = EXCLUDED.data_compra,
          data_vencimento = EXCLUDED.data_vencimento,
          categoria = EXCLUDED.categoria,
          subcategoria = EXCLUDED.subcategoria,
          tipo = EXCLUDED.tipo,
          status = EXCLUDED.status,
          status_pagamento = EXCLUDED.status_pagamento,
          parcelado = EXCLUDED.parcelado,
          parcelas_total = EXCLUDED.parcelas_total,
          parcela_atual = EXCLUDED.parcela_atual,
          observacao = EXCLUDED.observacao
      `, [
                tIds, tUserIds, tDescs, tVals, tDatas, tDatasCompra, tDatasVencimento, tCats, tSubcats,
                tTipos, tStatus, tStatusPg, tParcelado, tParcelas,
                tParcelaAtual, tObs
            ]);
        }

        // =========================================================================
        // 2. CATEGORIAS - BATCH UPSERT
        // =========================================================================
        if (dados.categorias && Array.isArray(dados.categorias)) {
            const catIds = dados.categorias.map(c => c.id).filter(id => id);
            if (catIds.length > 0) {
                await client.query(`
          DELETE FROM categories 
          WHERE user_id = $1 AND id NOT IN (SELECT unnest($2::text[]))
        `, [userId, catIds]);
            } else {
                await client.query('DELETE FROM categories WHERE user_id = $1', [userId]);
            }

            if (dados.categorias.length > 0) {
                const cIds = dados.categorias.map(c => c.id);
                const cUserIds = dados.categorias.map(() => userId);
                const cNomes = dados.categorias.map(c => c.nome);
                const cTipos = dados.categorias.map(c => c.tipo);
                const cSubcats = dados.categorias.map(c => c.subcategorias); // Array of text
                const cCores = dados.categorias.map(c => c.cor);
                const cIcones = dados.categorias.map(c => c.icone);
                const cIsCustom = dados.categorias.map(() => true);

                await client.query(`
          INSERT INTO categories (id, user_id, nome, tipo, subcategorias, cor, icone, is_custom)
          SELECT * FROM UNNEST(
            $1::text[], $2::text[], $3::text[], $4::text[], $5::text[][], $6::text[], $7::text[], $8::boolean[]
          )
          ON CONFLICT (id) DO UPDATE SET
            nome = EXCLUDED.nome,
            tipo = EXCLUDED.tipo,
            subcategorias = EXCLUDED.subcategorias,
            cor = EXCLUDED.cor,
            icone = EXCLUDED.icone
        `, [cIds, cUserIds, cNomes, cTipos, cSubcats, cCores, cIcones, cIsCustom]);
            }
        }

        // =========================================================================
        // 3. ORÇAMENTOS - BATCH INSERT
        // =========================================================================
        if (dados.orcamentos && Array.isArray(dados.orcamentos)) {
            const periodos = [...new Set(dados.orcamentos.map(o => o.mes))].filter(p => p);
            if (periodos.length > 0) {
                await client.query(`
          DELETE FROM budgets 
          WHERE user_id = $1 AND periodo = ANY($2::text[])
        `, [userId, periodos]);
            }

            const budgetRows = [];

            for (const orcamento of dados.orcamentos) {
                // Meta Data
                const metaItems = [
                    { key: 'META_RENDA_PREVISTA', value: orcamento.rendaPrevista },
                    { key: 'META_DIVIDAS', value: orcamento.dividas },
                    { key: 'META_RENDA_REAL', value: orcamento.rendaReal }
                ];

                metaItems.forEach(item => {
                    const metaId = `budget-meta-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    budgetRows.push({
                        id: metaId,
                        categoria: item.key,
                        valor: parseFloat(item.value || 0),
                        periodo: orcamento.mes
                    });
                });

                // Categories
                if (orcamento.categorias && Array.isArray(orcamento.categorias)) {
                    for (const cat of orcamento.categorias) {
                        let valorCalculado = 0;
                        if (cat.valorPlanejado) {
                            valorCalculado = parseFloat(cat.valorPlanejado);
                        } else if (cat.percentual && orcamento.rendaReal) {
                            valorCalculado = (parseFloat(orcamento.rendaReal) * parseFloat(cat.percentual)) / 100;
                        }
                        const catId = `budget-cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                        budgetRows.push({
                            id: catId,
                            categoria: cat.nome,
                            valor: valorCalculado,
                            periodo: orcamento.mes
                        });
                    }
                }
            }

            if (budgetRows.length > 0) {
                const bIds = budgetRows.map(b => b.id);
                const bUserIds = budgetRows.map(() => userId);
                const bCats = budgetRows.map(b => b.categoria);
                const bVals = budgetRows.map(b => b.valor);
                const bPeriodos = budgetRows.map(b => b.periodo);

                await client.query(`
          INSERT INTO budgets (id, user_id, categoria, valor_limite, periodo)
          SELECT * FROM UNNEST(
            $1::text[], $2::text[], $3::text[], $4::numeric[], $5::text[]
          )
        `, [bIds, bUserIds, bCats, bVals, bPeriodos]);
            }
        }

        // =========================================================================
        // 4. CARTÕES - BATCH UPSERT
        // =========================================================================
        if (dados.cartoes && Array.isArray(dados.cartoes)) {
            const cardIds = dados.cartoes.map(c => c.id).filter(id => id);
            if (cardIds.length > 0) {
                await client.query(`
          DELETE FROM cards 
          WHERE user_id = $1 AND id NOT IN (SELECT unnest($2::text[]))
        `, [userId, cardIds]);
            } else {
                await client.query('DELETE FROM cards WHERE user_id = $1', [userId]);
            }

            if (dados.cartoes.length > 0) {
                const cIds = dados.cartoes.map(c => c.id);
                const cUserIds = dados.cartoes.map(() => userId);
                const cNomes = dados.cartoes.map(c => c.nome);
                const cValores = dados.cartoes.map(c => typeof c.valores === 'object' ? JSON.stringify(c.valores) : '{}');

                await client.query(`
          INSERT INTO cards (id, user_id, nome, valores)
          SELECT id, user_id, nome, valores::jsonb
          FROM UNNEST(
            $1::text[], $2::text[], $3::text[], $4::text[]
          ) AS x(id, user_id, nome, valores)
          ON CONFLICT (id) DO UPDATE SET
            nome = EXCLUDED.nome,
            valores = EXCLUDED.valores
        `, [cIds, cUserIds, cNomes, cValores]);
            }
        }

        await client.query('COMMIT');
        return true;
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Erro ao salvar dados do usuário:', err);
        return false;
    } finally {
        client.release();
    }
};

const deletarUsuario = async (userId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM users WHERE id = $1', [userId]);
        await client.query('COMMIT');
        return true;
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Erro ao deletar usuário:', err);
        return false;
    } finally {
        client.release();
    }
};

const adicionarTransacao = async (userId, transacao) => {
    try {
        await pool.query(`
            INSERT INTO transactions (
                id, user_id, descricao, valor, data, data_compra, data_vencimento, categoria, subcategoria, 
                tipo, status, status_pagamento, parcelado, parcelas_total, 
                parcela_atual, observacao
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        `, [
            transacao.id,
            userId,
            transacao.descricao,
            transacao.valor,
            transacao.dataLancamento || transacao.data,
            transacao.dataCompra || null,
            transacao.dataVencimento || null,
            transacao.categoria,
            transacao.subcategoria || null,
            transacao.tipo,
            transacao.status || null,
            transacao.statusPagamento || transacao.status_pagamento || null,
            transacao.parcelado || false,
            transacao.parcelas || transacao.parcelas_total || null,
            transacao.parcelaAtual || transacao.parcela_atual || null,
            transacao.observacao || transacao.observacoes || null
        ]);
        return true;
    } catch (err) {
        console.error('Erro ao adicionar transação no PostgreSQL:', err);
        return false;
    }
};

const atualizarTransacao = async (userId, transacaoId, transacao) => {
    try {
        await pool.query(`
            UPDATE transactions SET
                descricao = $1,
                valor = $2,
                data = $3,
                data_compra = $4,
                data_vencimento = $5,
                categoria = $6,
                subcategoria = $7,
                tipo = $8,
                status = $9,
                status_pagamento = $10,
                parcelado = $11,
                parcelas_total = $12,
                parcela_atual = $13,
                observacao = $14
            WHERE id = $15 AND user_id = $16
        `, [
            transacao.descricao,
            transacao.valor,
            transacao.dataLancamento || transacao.data,
            transacao.dataCompra || null,
            transacao.dataVencimento || null,
            transacao.categoria,
            transacao.subcategoria || null,
            transacao.tipo,
            transacao.status || null,
            transacao.statusPagamento || transacao.status_pagamento || null,
            transacao.parcelado || false,
            transacao.parcelas || transacao.parcelas_total || null,
            transacao.parcelaAtual || transacao.parcela_atual || null,
            transacao.observacao || transacao.observacoes || null,
            transacaoId,
            userId
        ]);
        return true;
    } catch (err) {
        console.error('Erro ao atualizar transação no PostgreSQL:', err);
        return false;
    }
};

const deletarTransacao = async (userId, transacaoId) => {
    try {
        await pool.query('DELETE FROM transactions WHERE id = $1 AND user_id = $2', [transacaoId, userId]);
        return true;
    } catch (err) {
        console.error('Erro ao deletar transação no PostgreSQL:', err);
        return false;
    }
};

module.exports = {
    inicializarDB,
    getUsuarios,
    adicionarUsuario,
    atualizarUsuario,
    deletarUsuario,
    buscarDadosUsuario,
    salvarDadosUsuario,
    adicionarTransacao,
    atualizarTransacao,
    deletarTransacao
};
