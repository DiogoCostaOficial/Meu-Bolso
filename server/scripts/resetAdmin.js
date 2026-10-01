const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const dbPath = path.join(__dirname, '../data/database.json');
const now = new Date().toISOString();

async function resetAdmin() {
  const senhaPlana = 'admin123';
  const salt = bcrypt.genSaltSync(10);
  const senhaHash = bcrypt.hashSync(senhaPlana, salt);

  // 1. Atualizar banco local (JSON)
  if (fs.existsSync(dbPath)) {
    const raw = fs.readFileSync(dbPath, 'utf8');
    const data = JSON.parse(raw);
    const usuarios = Array.isArray(data.usuarios) ? data.usuarios : (data.usuarios = []);

    let admin = usuarios.find(u => u.tipo === 'admin' || u.email === 'admin@admin.com' || u.email === 'admin');

    if (admin) {
      admin.nome = admin.nome || 'Administrador';
      admin.email = 'admin@admin.com';
      admin.senha = senhaHash;
      admin.tipo = 'admin';
      admin.ativo = true;
      admin.primeiroAcesso = false;
      admin.dataCriacao = admin.dataCriacao || now;
    } else {
      usuarios.push({
        id: 'admin-' + Date.now(),
        nome: 'Administrador',
        email: 'admin@admin.com',
        senha: senhaHash,
        tipo: 'admin',
        ativo: true,
        primeiroAcesso: false,
        dataCriacao: now,
        ultimoAcesso: null
      });
    }

    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    console.log('✅ Banco local (JSON) atualizado:');
    console.log('   - Usuário: admin / admin@admin.com');
    console.log(`   - Senha: ${senhaPlana}`);
    console.log('   - Primeiro Acesso: false (login direto)');
  }

  // 2. Se houver DATABASE_URL configurada (PostgreSQL / Supabase), atualiza também
  if (process.env.DATABASE_URL) {
    try {
      const { Pool } = require('pg');
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      });
      const client = await pool.connect();
      console.log('🐘 Conectado ao PostgreSQL para resetar admin...');

      const res = await client.query(`
        UPDATE users 
        SET senha = $1, primeiro_acesso = false
        WHERE tipo = 'admin' OR email = 'admin@admin.com'
      `, [senhaHash]);

      if (res.rowCount === 0) {
        const id = 'admin-' + Date.now();
        await client.query(`
          INSERT INTO users (id, nome, email, senha, tipo, verificado, primeiro_acesso, created_at)
          VALUES ($1, 'Administrador', 'admin@admin.com', $2, 'admin', true, false, NOW())
        `, [id, senhaHash]);
        console.log('✅ Administrador criado no PostgreSQL (Supabase) com sucesso!');
      } else {
        console.log(`✅ Administrador atualizado no PostgreSQL (Supabase) (${res.rowCount} registro(s))!`);
      }

      client.release();
      await pool.end();
    } catch (pgErr) {
      console.warn('⚠️ Não foi possível conectar ao PostgreSQL/Supabase:', pgErr.message);
    }
  }
}

resetAdmin().then(() => {
  console.log('🎉 Reset de admin finalizado com sucesso!');
}).catch(err => {
  console.error('❌ Erro no reset de admin:', err);
});