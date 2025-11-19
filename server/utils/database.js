// server/utils/database.js
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/database.json');

const estruturaInicial = {
  usuarios: [],
  admin: {
    email: 'admin',
    senha: '',
    nome: 'Administrador',
    tipo: 'admin',
    primeiroAcesso: true,
    dataCriacao: new Date().toISOString()
  }
};

const inicializarDB = () => {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(estruturaInicial, null, 2));
      console.log('✅ Banco de dados inicializado');
    }
  } catch (error) {
    console.error('Erro ao inicializar DB:', error);
  }
};

const lerDBSync = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler DB:', error);
    return { ...estruturaInicial };
  }
};

const escreverDBSync = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao escrever DB:', error);
    return false;
  }
};

const getUsuarios = () => {
  const db = lerDBSync();
  return db.usuarios || [];
};

const salvarUsuarios = (usuarios) => {
  const db = lerDBSync();
  db.usuarios = usuarios;
  return escreverDBSync(db);
};

const adicionarUsuario = (usuario) => {
  const db = lerDBSync();
  db.usuarios = db.usuarios || [];
  db.usuarios.push(usuario);
  return escreverDBSync(db);
};

const buscarDadosUsuario = (userId) => {
  try {
    const dadosPath = path.join(__dirname, `../data/USER_DATA_${userId}.json`);
    if (!fs.existsSync(dadosPath)) {
      return {
        receitas: [],
        despesas: [],
        categorias: [],
        orcamentos: []
      };
    }
    const dados = fs.readFileSync(dadosPath, 'utf8');
    return JSON.parse(dados);
  } catch (error) {
    return {
      receitas: [],
      despesas: [],
      categorias: [],
      orcamentos: []
    };
  }
};

const salvarDadosUsuario = (userId, dados) => {
  try {
    const dadosPath = path.join(__dirname, `../data/USER_DATA_${userId}.json`);
    fs.writeFileSync(dadosPath, JSON.stringify(dados, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao salvar dados do usuário:', error);
    return false;
  }
};

module.exports = {
  inicializarDB,
  getUsuarios,
  salvarUsuarios,
  adicionarUsuario,
  buscarDadosUsuario,
  salvarDadosUsuario
};

inicializarDB();
