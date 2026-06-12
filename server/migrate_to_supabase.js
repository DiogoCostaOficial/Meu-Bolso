const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY; // Using anon key for client, but for admin tasks we might need service role if RLS is on. 
// However, since we have the DB connection string, we can use 'pg' for full access to create tables and insert data without RLS issues.
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function createTables() {
    const client = await pool.connect();
    try {
        console.log('Criando tabelas...');

        // Tabela Users
        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        nome TEXT,
        email TEXT UNIQUE,
        senha TEXT,
        tipo TEXT DEFAULT 'usuario',
        avatar TEXT,
        verificado BOOLEAN DEFAULT false,
        primeiro_acesso BOOLEAN DEFAULT false,
        otp_codigo TEXT,
        otp_expiracao TIMESTAMP,
        reset_token TEXT,
        reset_token_expiracao TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Tabela Transactions (Receitas e Despesas)
        await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        descricao TEXT,
        valor NUMERIC,
        data DATE,
        data_compra DATE,
        data_vencimento DATE,
        categoria TEXT,
        subcategoria TEXT,
        tipo TEXT, -- 'receita' ou 'despesa'
        status TEXT,
        status_pagamento TEXT,
        parcelado BOOLEAN DEFAULT false,
        parcelas_total INTEGER,
        parcela_atual INTEGER,
        observacao TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Garantir que a coluna data_compra existe se a tabela já foi criada anteriormente
        await client.query(`
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS data_compra DATE;
    `);

        // Garantir que a coluna data_vencimento existe se a tabela já foi criada anteriormente
        await client.query(`
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS data_vencimento DATE;
    `);

        // Tabela Categories (Categorias personalizadas)
        await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        nome TEXT,
        tipo TEXT, -- 'receita' ou 'despesa'
        subcategorias TEXT[], -- Array de strings para subcategorias
        cor TEXT,
        icone TEXT,
        is_custom BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Tabela Budgets (Orçamentos)
        await client.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        categoria TEXT,
        valor_limite NUMERIC,
        periodo TEXT, -- 'mensal', 'anual', etc.
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Tabela Cards (Cartões)
        await client.query(`
      CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        nome TEXT,
        valores JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

        console.log('Tabelas criadas com sucesso!');
    } catch (err) {
        console.error('Erro ao criar tabelas:', err);
        throw err;
    } finally {
        client.release();
    }
}

async function migrateData() {
    const client = await pool.connect();
    try {
        console.log('Iniciando migração de dados...');

        // 1. Migrar Usuários
        const dbPath = path.join(__dirname, 'data', 'database.json');
        if (fs.existsSync(dbPath)) {
            const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            const usuarios = dbData.usuarios || [];

            for (const user of usuarios) {
                console.log(`Migrando usuário: ${user.nome} (${user.email})`);

                // Verificar se usuário já existe
                const res = await client.query('SELECT id FROM users WHERE email = $1', [user.email]);
                if (res.rows.length === 0) {
                    await client.query(`
            INSERT INTO users (id, nome, email, senha, tipo, avatar, verificado, primeiro_acesso, otp_codigo)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [user.id, user.nome, user.email, user.senha, user.tipo, user.avatar, user.verificado, user.primeiroAcesso, user.otpCodigo]);
                } else {
                    console.log(`Usuário ${user.email} já existe, pulando...`);
                }

                // 2. Migrar Dados do Usuário (Transações, Categorias, etc.)
                // O nome do arquivo pode ser USER_DATA_userId.json ou USER_DATA_user-userId.json
                // Vamos tentar encontrar o arquivo correto
                let userDataPath = path.join(__dirname, 'data', `USER_DATA_${user.id}.json`);
                if (!fs.existsSync(userDataPath)) {
                    // Tenta formatar o ID se ele tiver prefixo 'user-' duplicado ou algo assim, mas o padrão parece ser USER_DATA_ID.json
                    // Mas no list_dir vi: USER_DATA_user-1763162160964.json
                    // Se o ID do usuário for "user-1763162160964", então o arquivo é USER_DATA_user-1763162160964.json
                    // Se o ID for "1763162160964", o arquivo seria USER_DATA_1763162160964.json
                    // Vamos checar o ID do usuário no database.json.
                    // Assumindo que o nome do arquivo segue o ID.
                }

                // Se não achou direto, tenta procurar na lista de arquivos
                if (!fs.existsSync(userDataPath)) {
                    const files = fs.readdirSync(path.join(__dirname, 'data'));
                    const userFile = files.find(f => f.includes(user.id));
                    if (userFile) {
                        userDataPath = path.join(__dirname, 'data', userFile);
                    }
                }

                if (fs.existsSync(userDataPath)) {
                    const userData = JSON.parse(fs.readFileSync(userDataPath, 'utf8'));

                    // Migrar Receitas
                    if (userData.receitas) {
                        for (const rec of userData.receitas) {
                            await client.query(`
                INSERT INTO transactions (id, user_id, descricao, valor, data, data_compra, data_vencimento, categoria, subcategoria, tipo, status, status_pagamento, parcelado, parcelas_total, parcela_atual, observacao)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'receita', $10, $11, $12, $13, $14, $15)
                ON CONFLICT (id) DO NOTHING
              `, [rec.id, user.id, rec.descricao, rec.valor, rec.data, rec.dataCompra || null, rec.dataVencimento || null, rec.categoria, rec.subcategoria, rec.status, rec.statusPagamento, rec.parcelado, rec.parcelas, rec.parcelaAtual, rec.observacao]);
                        }
                    }

                    // Migrar Despesas
                    if (userData.despesas) {
                        for (const desp of userData.despesas) {
                            await client.query(`
                INSERT INTO transactions (id, user_id, descricao, valor, data, data_compra, data_vencimento, categoria, subcategoria, tipo, status, status_pagamento, parcelado, parcelas_total, parcela_atual, observacao)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'despesa', $10, $11, $12, $13, $14, $15)
                ON CONFLICT (id) DO NOTHING
              `, [desp.id, user.id, desp.descricao, desp.valor, desp.data, desp.dataCompra || null, desp.dataVencimento || null, desp.categoria, desp.subcategoria, desp.status, desp.statusPagamento, desp.parcelado, desp.parcelas, desp.parcelaAtual, desp.observacao]);
                        }
                    }

                    // Migrar Categorias Personalizadas
                    if (userData.categorias) {
                        for (const cat of userData.categorias) {
                            const categoryId = cat.id || `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                            await client.query(`
                INSERT INTO categories (id, user_id, nome, tipo, subcategorias, cor, icone, is_custom)
                VALUES ($1, $2, $3, $4, $5, $6, $7, true)
                ON CONFLICT (id) DO NOTHING
              `, [categoryId, user.id, cat.nome, cat.tipo, cat.subcategorias, cat.cor, cat.icone]);
                        }
                    }

                    // Migrar Orçamentos
                    if (userData.orcamentos) {
                        for (const orc of userData.orcamentos) {
                            await client.query(`
                INSERT INTO budgets (id, user_id, categoria, valor_limite, periodo)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (id) DO NOTHING
              `, [orc.id || `orc-${Date.now()}-${Math.random()}`, user.id, orc.categoria, orc.valorLimite, orc.periodo]);
                        }
                    }

                    // Migrar Cartões
                    if (userData.cartoes) {
                        for (const card of userData.cartoes) {
                            await client.query(`
                INSERT INTO cards (id, user_id, nome, valores)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (id) DO NOTHING
              `, [card.id || `card-${Date.now()}-${Math.random()}`, user.id, card.nome, JSON.stringify(card.valores || {})]);
                        }
                    }

                    console.log(`Dados do usuário ${user.nome} migrados com sucesso.`);
                } else {
                    console.log(`Arquivo de dados não encontrado para o usuário ${user.nome} (ID: ${user.id})`);
                }
            }
        }

        console.log('Migração concluída!');
    } catch (err) {
        console.error('Erro na migração:', err);
    } finally {
        client.release();
        pool.end();
    }
}

// Executar
(async () => {
    await createTables();
    await migrateData();
})();
