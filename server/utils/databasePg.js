const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

let dbInitPromise = null;

const inicializarDB = async () => {
    if (!dbInitPromise) {
        dbInitPromise = (async () => {
            let client;
            try {
                client = await pool.connect();
                console.log('🐘 Conectado ao Supabase Postgres - Verificando migrações de schema...');
                try {
                    await client.query(`
                        CREATE TABLE IF NOT EXISTS cards (
                            id TEXT PRIMARY KEY,
                            user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                            nome TEXT,
                            valores JSONB DEFAULT '{}'::jsonb,
                            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                        );

                        ALTER TABLE categories 
                        ADD COLUMN IF NOT EXISTS tipo_meta VARCHAR(20),
                        ADD COLUMN IF NOT EXISTS valor_meta NUMERIC(15, 2);

                        ALTER TABLE transactions 
                        ADD COLUMN IF NOT EXISTS cartao TEXT,
                        ADD COLUMN IF NOT EXISTS cartao_id TEXT,
                        ADD COLUMN IF NOT EXISTS mes_fatura VARCHAR(20);
                    `);
                    console.log('✅ Migração de colunas concluída com sucesso no PostgreSQL!');
                } catch (colErr) {
                    console.warn('Nota: Aviso ao aplicar colunas no Postgres:', colErr.message);
                }
            } catch (err) {
                console.error('Erro ao conectar ao DB na inicialização:', err);
                dbInitPromise = null;
            } finally {
                if (client) client.release();
            }
        })();
    }
    return dbInitPromise;
};

// Executa automaticamente na carga do módulo
inicializarDB().catch(() => {});

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
            dataCriacao: u.created_at ? u.created_at.toISOString() : null,
            ultimoAcesso: u.ultimo_acesso ? u.ultimo_acesso.toISOString() : null,
            ativo: true
        }));
    } catch (err) {
        console.error('Erro ao buscar usuários:', err);
        return [];
    }
};

// Helper function to sync database.json user list local backup
const syncLocalUsersJson = async () => {
    try {
        const fs = require('fs');
        const path = require('path');
        const dataDir = path.join(__dirname, '..', 'data');
        const databasePath = path.join(dataDir, 'database.json');

        const res = await pool.query('SELECT * FROM users');
        const usuarios = res.rows.map(u => ({
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
            dataCriacao: u.created_at ? u.created_at.toISOString() : null,
            ultimoAcesso: u.ultimo_acesso ? u.ultimo_acesso.toISOString() : null,
            ativo: true
        }));

        const databaseObj = { usuarios };
        
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        fs.writeFileSync(databasePath, JSON.stringify(databaseObj, null, 2), 'utf8');
        console.log('💾 Contas de usuários sincronizadas com sucesso no database.json local!');
    } catch (err) {
        console.error('⚠️ Falha ao sincronizar database.json local:', err);
    }
};

const adicionarUsuario = async (usuario) => {
    try {
        await pool.query(`
      INSERT INTO users (id, nome, email, senha, tipo, avatar, verificado, primeiro_acesso, otp_codigo, otp_expiracao, created_at, ultimo_acesso)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
            usuario.id, usuario.nome, usuario.email, usuario.senha, usuario.tipo, 
            usuario.avatar, usuario.verificado, usuario.primeiroAcesso, usuario.otpCodigo, 
            usuario.otpExpira, usuario.dataCriacao || new Date().toISOString(), usuario.ultimoAcesso
        ]);
        
        // Sincroniza localmente
        await syncLocalUsersJson();
        
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
        otp_expiracao = $8,
        ultimo_acesso = $9
      WHERE id = $10
    `, [
            usuario.nome, usuario.email, usuario.senha, usuario.avatar, 
            usuario.verificado, usuario.primeiroAcesso, usuario.otpCodigo, 
            usuario.otpExpira, usuario.ultimoAcesso, usuario.id
        ]);
        
        // Sincroniza localmente
        await syncLocalUsersJson();
        
        return true;
    } catch (err) {
        console.error('Erro ao atualizar usuário:', err);
        return false;
    }
};

const buscarDadosUsuario = async (userId) => {
    await inicializarDB();
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
            } else if (row.categoria.startsWith('META_PERCENT_')) {
                const catNome = row.categoria.replace('META_PERCENT_', '');
                monthData.metaPercentuais = monthData.metaPercentuais || {};
                monthData.metaPercentuais[catNome] = valor;
            } else if (row.categoria.startsWith('META_TIPO_')) {
                const catNome = row.categoria.replace('META_TIPO_', '');
                monthData.metaTipos = monthData.metaTipos || {};
                monthData.metaTipos[catNome] = valor === 1 ? 'valor' : 'percentual';
            } else {
                // Regular category
                monthData.categorias.push({
                    nome: row.categoria,
                    valorPlanejado: valor,
                    percentual: 0,
                    cor: categoryColors[row.categoria] || '#CCCCCC'
                });
            }
        });

        // Calculate percentages and finalize structure
        const finalOrcamentos = Object.values(budgetsByMonth).map(orc => {
            if (orc.rendaReal > 0) {
                orc.categorias = orc.categorias.map(cat => ({
                    ...cat,
                    tipoMeta: (orc.metaTipos && orc.metaTipos[cat.nome]) ? orc.metaTipos[cat.nome] : 'percentual',
                    // Use explicit meta percentual if available, otherwise fallback to calculation
                    percentual: (orc.metaPercentuais && orc.metaPercentuais[cat.nome] !== undefined) 
                        ? orc.metaPercentuais[cat.nome] 
                        : parseFloat(((cat.valorPlanejado / orc.rendaReal) * 100).toFixed(2))
                }));
            } else if (orc.metaPercentuais) {
                orc.categorias = orc.categorias.map(cat => ({
                    ...cat,
                    tipoMeta: (orc.metaTipos && orc.metaTipos[cat.nome]) ? orc.metaTipos[cat.nome] : 'percentual',
                    percentual: orc.metaPercentuais[cat.nome] !== undefined ? orc.metaPercentuais[cat.nome] : 0
                }));
            } else {
                orc.categorias = orc.categorias.map(cat => ({
                    ...cat,
                    tipoMeta: (orc.metaTipos && orc.metaTipos[cat.nome]) ? orc.metaTipos[cat.nome] : 'percentual'
                }));
            }
            // Cleanup internal meta field
            delete orc.metaPercentuais;
            delete orc.metaTipos;
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
                    dataVencimento: dataVenc || '',
                    cartao: r.cartao || null,
                    cartaoId: r.cartao_id || null,
                    mesFatura: r.mes_fatura || null
                };
            }),
            categorias: categoriasRes.rows.map(c => ({
                id: c.id,
                nome: c.nome,
                tipo: c.tipo,
                subcategorias: c.subcategorias,
                cor: c.cor,
                icone: c.icone,
                tipoMeta: c.tipo_meta || null,
                valorMeta: c.valor_meta !== null && c.valor_meta !== undefined ? parseFloat(c.valor_meta) : null
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
    await inicializarDB();
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // =========================================================================
        // 1. TRANSAÇÕES (RECEITAS E DESPESAS) - BATCH UPSERT
        // =========================================================================

        const incomingTransactions = [];

        // 1.1 TRATAMENTO DE RECEITAS
        if (dados.receitas && Array.isArray(dados.receitas)) {
            const receitaIds = dados.receitas.map(r => String(r.id)).filter(id => id && id !== 'undefined' && id !== 'null');
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
            const despesaIds = dados.despesas.map(d => String(d.id)).filter(id => id && id !== 'undefined' && id !== 'null');
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
            const tIds = incomingTransactions.map(t => String(t.id));
            const tUserIds = incomingTransactions.map(() => String(userId));
            const tDescs = incomingTransactions.map(t => String(t.descricao || ''));
            const tVals = incomingTransactions.map(t => parseFloat(t.valor) || 0);
            const tDatas = incomingTransactions.map(t => {
                const d = t.dataLancamento || t.data;
                if (!d) return new Date().toISOString().split('T')[0];
                return String(d).split('T')[0];
            });
            const tDatasCompra = incomingTransactions.map(t => {
                if (!t.dataCompra || t.dataCompra === '') return null;
                return String(t.dataCompra).split('T')[0];
            });
            const tDatasVencimento = incomingTransactions.map(t => {
                if (!t.dataVencimento || t.dataVencimento === '') return null;
                return String(t.dataVencimento).split('T')[0];
            });
            const tCats = incomingTransactions.map(t => String(t.categoria || 'Geral'));
            const tSubcats = incomingTransactions.map(t => t.subcategoria ? String(t.subcategoria) : null);
            const tTipos = incomingTransactions.map(t => String(t.tipo));
            const tStatus = incomingTransactions.map(t => t.status ? String(t.status) : null);
            const tStatusPg = incomingTransactions.map(t => t.statusPagamento ? String(t.statusPagamento) : null);
            const tParcelado = incomingTransactions.map(t => Boolean(t.parcelado));
            const tParcelas = incomingTransactions.map(t => {
                const val = t.parcelas || t.parcelas_total;
                return val ? parseInt(val, 10) : null;
            });
            const tParcelaAtual = incomingTransactions.map(t => {
                const val = t.parcelaAtual || t.parcela_atual;
                return val ? parseInt(val, 10) : null;
            });
            const tObs = incomingTransactions.map(t => {
                const val = t.observacao || t.observacoes;
                return val ? String(val) : null;
            });
            const tCartao = incomingTransactions.map(t => t.cartao ? String(t.cartao) : null);
            const tCartaoId = incomingTransactions.map(t => {
                const cid = t.cartaoId || t.cartao_id;
                return cid ? String(cid) : null;
            });
            const tMesFatura = incomingTransactions.map(t => {
                const mf = t.mesFatura || t.mes_fatura;
                return mf ? String(mf) : null;
            });

            await client.query(`
        INSERT INTO transactions (
          id, user_id, descricao, valor, data, data_compra, data_vencimento, categoria, subcategoria, 
          tipo, status, status_pagamento, parcelado, parcelas_total, 
          parcela_atual, observacao, cartao, cartao_id, mes_fatura
        )
        SELECT * FROM UNNEST(
          $1::text[], $2::text[], $3::text[], $4::numeric[], $5::date[], $6::date[], $7::date[], $8::text[], $9::text[],
          $10::text[], $11::text[], $12::text[], $13::boolean[], $14::integer[],
          $15::integer[], $16::text[], $17::text[], $18::text[], $19::text[]
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
          observacao = EXCLUDED.observacao,
          cartao = EXCLUDED.cartao,
          cartao_id = EXCLUDED.cartao_id,
          mes_fatura = EXCLUDED.mes_fatura
      `, [
                tIds, tUserIds, tDescs, tVals, tDatas, tDatasCompra, tDatasVencimento, tCats, tSubcats,
                tTipos, tStatus, tStatusPg, tParcelado, tParcelas,
                tParcelaAtual, tObs, tCartao, tCartaoId, tMesFatura
            ]);
        }

        // =========================================================================
        // 2. CATEGORIAS - UPSERT
        // =========================================================================
        if (dados.categorias && Array.isArray(dados.categorias)) {
            // Guarantee all categories have IDs before saving
            dados.categorias = dados.categorias.map(c => {
                if (!c.id) {
                    return { ...c, id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
                }
                return c;
            });

            const catIds = dados.categorias.map(c => c.id).filter(id => id);
            
            if (catIds.length > 0) {
                await client.query(`
          DELETE FROM categories 
          WHERE user_id = $1 AND id NOT IN (SELECT unnest($2::text[]))
        `, [userId, catIds]);
            } else {
                await client.query('DELETE FROM categories WHERE user_id = $1', [userId]);
            }

            for (const c of dados.categorias) {
                await client.query(`
                    INSERT INTO categories (id, user_id, nome, tipo, subcategorias, cor, icone, is_custom, tipo_meta, valor_meta)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    ON CONFLICT (id) DO UPDATE SET
                        nome = EXCLUDED.nome,
                        tipo = EXCLUDED.tipo,
                        subcategorias = EXCLUDED.subcategorias,
                        cor = EXCLUDED.cor,
                        icone = EXCLUDED.icone,
                        tipo_meta = EXCLUDED.tipo_meta,
                        valor_meta = EXCLUDED.valor_meta
                `, [
                    c.id,
                    userId,
                    c.nome,
                    c.tipo || null,
                    c.subcategorias || [],
                    c.cor || '#000000',
                    c.icone || null,
                    true,
                    c.tipoMeta || null,
                    c.valorMeta !== undefined && c.valorMeta !== null && c.valorMeta !== '' ? parseFloat(c.valorMeta) : null
                ]);
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
                        if (cat.valorPlanejado !== undefined && cat.valorPlanejado !== null && cat.valorPlanejado !== '') {
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
                        
                        if (cat.percentual !== undefined) {
                            budgetRows.push({
                                id: `budget-perc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                categoria: `META_PERCENT_${cat.nome}`,
                                valor: parseFloat(cat.percentual),
                                periodo: orcamento.mes
                            });
                        }

                        if (cat.tipoMeta) {
                            budgetRows.push({
                                id: `budget-tipometa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                categoria: `META_TIPO_${cat.nome}`,
                                valor: cat.tipoMeta === 'valor' ? 1 : 2,
                                periodo: orcamento.mes
                            });
                        }
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
            const cardIds = dados.cartoes.map(c => String(c.id)).filter(id => id && id !== 'undefined' && id !== 'null');
            if (cardIds.length > 0) {
                await client.query(`
          DELETE FROM cards 
          WHERE user_id = $1 AND id NOT IN (SELECT unnest($2::text[]))
        `, [userId, cardIds]);
            } else {
                await client.query('DELETE FROM cards WHERE user_id = $1', [userId]);
            }

            if (dados.cartoes.length > 0) {
                const cIds = dados.cartoes.map(c => String(c.id));
                const cUserIds = dados.cartoes.map(() => String(userId));
                const cNomes = dados.cartoes.map(c => String(c.nome || 'Cartão'));
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

        // =========================================================================
        // 5. BACKUP LOCAL AUTOMÁTICO EM JSON
        // =========================================================================
        try {
            const fs = require('fs');
            const path = require('path');
            const dataDir = path.join(__dirname, '..', 'data');
            
            // Garantir que a pasta data existe
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            const backupFilePath = path.join(dataDir, `USER_DATA_${userId}.json`);
            fs.writeFileSync(backupFilePath, JSON.stringify(dados, null, 2), 'utf8');
            console.log(`💾 Cópia de segurança JSON salva automaticamente para o usuário: ${userId}`);
        } catch (backupError) {
            console.error('⚠️ Falha ao salvar cópia de segurança JSON:', backupError);
        }

        return true;
    } catch (err) {
        try {
            await client.query('ROLLBACK');
        } catch (_) {}
        console.error('Erro ao salvar dados do usuário no Postgres:', err);
        throw err;
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
    await inicializarDB();
    try {
        await pool.query(`
            INSERT INTO transactions (
                id, user_id, descricao, valor, data, data_compra, data_vencimento, categoria, subcategoria, 
                tipo, status, status_pagamento, parcelado, parcelas_total, 
                parcela_atual, observacao, cartao, cartao_id, mes_fatura
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
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
            transacao.observacao || transacao.observacoes || null,
            transacao.cartao || null,
            transacao.cartaoId || transacao.cartao_id || null,
            transacao.mesFatura || transacao.mes_fatura || null
        ]);
        return true;
    } catch (err) {
        console.error('Erro ao adicionar transação no PostgreSQL:', err);
        return false;
    }
};

const atualizarTransacao = async (userId, transacaoId, transacao) => {
    await inicializarDB();
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
                observacao = $14,
                cartao = $15,
                cartao_id = $16,
                mes_fatura = $17
            WHERE id = $18 AND user_id = $19
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
            transacao.cartao !== undefined ? transacao.cartao : null,
            transacao.cartaoId !== undefined ? transacao.cartaoId : (transacao.cartao_id !== undefined ? transacao.cartao_id : null),
            transacao.mesFatura !== undefined ? transacao.mesFatura : (transacao.mes_fatura !== undefined ? transacao.mes_fatura : null),
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
