require('dotenv').config();

// Determine which implementation to use
const shouldUseJson = process.env.USE_JSON_STORAGE === 'true' || !process.env.DATABASE_URL;

let dbImpl;
if (shouldUseJson) {
  console.log('📦 Using JSON File Storage (Auto fallback: DATABASE_URL is not set)');
  dbImpl = require('./databaseJson');
} else {
  console.log('🐘 Using PostgreSQL Storage');
  dbImpl = require('./databasePg');
}

// Inicializa o banco de dados (cria/atualiza tabelas e colunas se necessário)
if (dbImpl.inicializarDB) {
  dbImpl.inicializarDB().catch(err => {
    console.error('Erro na inicialização do banco de dados:', err);
  });
}

module.exports = dbImpl;
