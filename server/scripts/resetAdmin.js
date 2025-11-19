const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../data/database.json');
const now = new Date().toISOString();

const raw = fs.readFileSync(dbPath, 'utf8');
const data = JSON.parse(raw);
const usuarios = Array.isArray(data.usuarios) ? data.usuarios : (data.usuarios = []);

const salt = bcrypt.genSaltSync(10);
const senhaHash = bcrypt.hashSync('admin', salt);

let admin = usuarios.find(u => u.tipo === 'admin' || u.email === 'admin@admin.com' || u.email === 'admin');

if (admin) {
  admin.nome = admin.nome || 'Administrador';
  admin.email = 'admin@admin.com';
  admin.senha = senhaHash;
  admin.tipo = 'admin';
  admin.ativo = true;
  admin.primeiroAcesso = false;
  admin.dataCriacao = admin.dataCriacao || now;
  admin.ultimoAcesso = admin.ultimoAcesso || null;
} else {
  const id = 'admin-' + Date.now();
  usuarios.push({
    id,
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
console.log('Admin reset concluído: email=admin@admin.com senha=admin');