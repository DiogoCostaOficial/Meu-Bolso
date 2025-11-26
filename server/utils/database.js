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

    return {
      receitas: receitasRes.rows.map(r => ({
        id: r.id,
        descricao: r.descricao,
        valor: parseFloat(r.valor),
        data: r.data, // Postgres returns Date object, might need formatting
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
        data: r.data,
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
      orcamentos: orcamentosRes.rows.map(o => ({
        id: o.id,
        categoria: o.categoria,
        valorLimite: parseFloat(o.valor_limite),
        periodo: o.periodo
      }))
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

    // Delete existing
    await client.query('DELETE FROM transactions WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM categories WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM budgets WHERE user_id = $1', [userId]);

    // Insert Receitas
    if (dados.receitas && Array.isArray(dados.receitas)) {
      for (const r of dados.receitas) {
        await client.query(`
          INSERT INTO transactions (id, user_id, descricao, valor, data, categoria, subcategoria, tipo, status, status_pagamento, parcelado, parcelas_total, parcela_atual, observacao)
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'receita', $8, $9, $10, $11, $12, $13)
        `, [r.id, userId, r.descricao, r.valor, r.data, r.categoria, r.subcategoria, r.status, r.statusPagamento, r.parcelado, r.parcelas, r.parcelaAtual, r.observacao]);
      }
    }

    // Insert Despesas
    if (dados.despesas && Array.isArray(dados.despesas)) {
      for (const r of dados.despesas) {
        await client.query(`
          INSERT INTO transactions (id, user_id, descricao, valor, data, categoria, subcategoria, tipo, status, status_pagamento, parcelado, parcelas_total, parcela_atual, observacao)
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'despesa', $8, $9, $10, $11, $12, $13)
        `, [r.id, userId, r.descricao, r.valor, r.data, r.categoria, r.subcategoria, r.status, r.statusPagamento, r.parcelado, r.parcelas, r.parcelaAtual, r.observacao]);
      }
    }

    // Insert Categories
    if (dados.categorias && Array.isArray(dados.categorias)) {
      for (const c of dados.categorias) {
        await client.query(`
          INSERT INTO categories (id, user_id, nome, tipo, subcategorias, cor, icone, is_custom)
          VALUES ($1, $2, $3, $4, $5, $6, $7, true)
        `, [c.id, userId, c.nome, c.tipo, c.subcategorias, c.cor, c.icone]);
      }
    }

    // Insert Budgets
    if (dados.orcamentos && Array.isArray(dados.orcamentos)) {
      for (const o of dados.orcamentos) {
        await client.query(`
          INSERT INTO budgets (id, user_id, categoria, valor_limite, periodo)
          VALUES ($1, $2, $3, $4, $5)
        `, [o.id, userId, o.categoria, o.valorLimite, o.periodo]);
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
