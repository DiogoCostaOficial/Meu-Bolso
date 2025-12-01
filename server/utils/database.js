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
        categoria: r.categoria,
        subcategoria: r.subcategoria,
        status: r.status,
        statusPagamento: r.status_pagamento,
        parcelado: r.parcelado,
        parcelas: r.parcelas_total,
        parcelaAtual: r.parcela_atual,
        observacao: r.observacao
      })),
      despesas: despesasRes.rows.map(r => ({
        id: r.id,
        descricao: r.descricao,
        valor: parseFloat(r.valor),
        data: r.data instanceof Date ? r.data.toISOString().split('T')[0] : r.data,
        categoria: r.categoria,
        subcategoria: r.subcategoria,
        status: r.status,
        statusPagamento: r.status_pagamento,
        parcelado: r.parcelado,
        parcelas: r.parcelas_total,
        parcelaAtual: r.parcela_atual,
        observacao: r.observacao
      })),
      categorias: categoriasRes.rows.map(c => ({
        id: c.id,
        nome: c.nome,
        tipo: c.tipo,
        subcategorias: c.subcategorias,
        cor: c.cor,
        icone: c.icone
      })),
      orcamentos: finalOrcamentos
    };
  } catch (err) {
    console.error('Erro ao buscar dados do usuário:', err);
    return { receitas: [], despesas: [], categorias: [], orcamentos: [] };
  } finally {
    client.release();
  }
};

const salvarDadosUsuario = async (userId, dados) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // =========================================================================
    // 1. TRANSAÇÕES (RECEITAS E DESPESAS) - OTIMIZADO COM UPSERT
    // =========================================================================

    // Coletar todas as transações recebidas (receitas + despesas)
    const incomingTransactions = [];
    if (dados.receitas && Array.isArray(dados.receitas)) {
      dados.receitas.forEach(r => incomingTransactions.push({ ...r, tipo: 'receita' }));
    }
    if (dados.despesas && Array.isArray(dados.despesas)) {
      dados.despesas.forEach(d => incomingTransactions.push({ ...d, tipo: 'despesa' }));
    }

    if (incomingTransactions.length > 0) {
      // A. Identificar IDs para manter/atualizar
      const incomingIds = incomingTransactions.map(t => t.id).filter(id => id);

      // B. Deletar apenas o que NÃO está na lista recebida (Limpeza seletiva)
      // Nota: Usamos unnest para performance com arrays grandes
      if (incomingIds.length > 0) {
        await client.query(`
          DELETE FROM transactions 
          WHERE user_id = $1 
          AND id NOT IN (SELECT unnest($2::text[]))
        `, [userId, incomingIds]);
      }

      // C. Upsert (Inserir ou Atualizar) cada transação
      for (const t of incomingTransactions) {
        await client.query(`
          INSERT INTO transactions (id, user_id, descricao, valor, data, categoria, subcategoria, tipo, status, status_pagamento, parcelado, parcelas_total, parcela_atual, observacao)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (id) DO UPDATE SET
            descricao = EXCLUDED.descricao,
            valor = EXCLUDED.valor,
            data = EXCLUDED.data,
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
          t.id,
          userId,
          t.descricao,
          t.valor,
          t.data,
          t.categoria,
          t.subcategoria,
          t.tipo,
          t.status,
          t.statusPagamento,
          t.parcelado,
          t.parcelas,
          t.parcelaAtual,
          t.observacao
        ]);
      }
    } else if (dados.receitas || dados.despesas) {
      // Se as chaves existem mas estão vazias, significa que o usuário deletou tudo
      await client.query('DELETE FROM transactions WHERE user_id = $1', [userId]);
    }

    // =========================================================================
    // 2. CATEGORIAS - OTIMIZADO COM UPSERT
    // =========================================================================
    if (dados.categorias && Array.isArray(dados.categorias)) {
      const catIds = dados.categorias.map(c => c.id).filter(id => id);

      // Deletar categorias removidas
      if (catIds.length > 0) {
        await client.query(`
          DELETE FROM categories 
          WHERE user_id = $1 
          AND id NOT IN (SELECT unnest($2::text[]))
        `, [userId, catIds]);
      } else {
        await client.query('DELETE FROM categories WHERE user_id = $1', [userId]);
      }

      // Upsert categorias
      for (const c of dados.categorias) {
        await client.query(`
          INSERT INTO categories (id, user_id, nome, tipo, subcategorias, cor, icone, is_custom)
          VALUES ($1, $2, $3, $4, $5, $6, $7, true)
          ON CONFLICT (id) DO UPDATE SET
            nome = EXCLUDED.nome,
            tipo = EXCLUDED.tipo,
            subcategorias = EXCLUDED.subcategorias,
            cor = EXCLUDED.cor,
            icone = EXCLUDED.icone
        `, [c.id, userId, c.nome, c.tipo, c.subcategorias, c.cor, c.icone]);
      }
    }

    // =========================================================================
    // 3. ORÇAMENTOS (Mantido recriação pois IDs são dinâmicos no frontend atual)
    // =========================================================================
    // Como os orçamentos são poucos registros, o impacto é mínimo.
    if (dados.orcamentos && Array.isArray(dados.orcamentos)) {
      await client.query('DELETE FROM budgets WHERE user_id = $1', [userId]);

      for (const orcamento of dados.orcamentos) {
        // 1. Insert Meta Data
        const metaItems = [
          { key: 'META_RENDA_PREVISTA', value: orcamento.rendaPrevista },
          { key: 'META_DIVIDAS', value: orcamento.dividas },
          { key: 'META_RENDA_REAL', value: orcamento.rendaReal }
        ];

        for (const item of metaItems) {
          const metaId = `budget-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
          await client.query(`
            INSERT INTO budgets (id, user_id, categoria, valor_limite, periodo)
            VALUES ($1, $2, $3, $4, $5)
          `, [metaId, userId, item.key, parseFloat(item.value || 0), orcamento.mes]);
        }

        // 2. Insert Categories
        if (orcamento.categorias && Array.isArray(orcamento.categorias)) {
          for (const cat of orcamento.categorias) {
            let valorCalculado = 0;
            if (cat.valorPlanejado) {
              valorCalculado = parseFloat(cat.valorPlanejado);
            } else if (cat.percentual && orcamento.rendaReal) {
              valorCalculado = (parseFloat(orcamento.rendaReal) * parseFloat(cat.percentual)) / 100;
            }

            const catId = `budget-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

            await client.query(`
              INSERT INTO budgets (id, user_id, categoria, valor_limite, periodo)
              VALUES ($1, $2, $3, $4, $5)
            `, [catId, userId, cat.nome, valorCalculado, orcamento.mes]);
          }
        }
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

    // Delete related data first (Cascade should handle this but let's be explicit or rely on cascade)
    // Since we defined ON DELETE CASCADE in migration, deleting user is enough.
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

module.exports = {
  inicializarDB,
  getUsuarios,
  adicionarUsuario,
  atualizarUsuario,
  deletarUsuario,
  buscarDadosUsuario,
  salvarDadosUsuario
};
