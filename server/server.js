// server/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Importa as rotas
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');

// Configuração de rotas flexível (para funcionar com ou sem rewrite do Vercel)
const router = express.Router();
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/user', userRoutes);

// Monta as rotas tanto em /api quanto na raiz para garantir compatibilidade
app.use('/api', router);
app.use('/', router);

// Rota de teste
app.get('/', (req, res) => {
  res.json({
    message: 'API Meu Bolso está rodando!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      user: '/api/user'
    }
  });
});

// Rota 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  });
});

// Inicia o servidor
// Inicia o servidor apenas se não estiver em produção (Vercel exporta o app)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`\n✅ Servidor rodando na porta ${PORT}`);
    console.log(`🌐 API: http://localhost:${PORT}`);
    console.log(`📚 Endpoints disponíveis:`);
    console.log(`   - POST http://localhost:${PORT}/api/auth/registrar`);
    console.log(`   - POST http://localhost:${PORT}/api/auth/login`);
    console.log(`   - POST http://localhost:${PORT}/api/auth/alterar-senha`);
    console.log(`\n✨ Banco de dados carregado com sucesso!\n`);
  });
}

module.exports = app;
