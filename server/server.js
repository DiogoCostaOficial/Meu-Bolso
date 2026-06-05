// server/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://financas-facil-i3zn.vercel.app',
  'https://meu-bolso.vercel.app' // Adicione outras URLs se tiver
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      // Se a origem não estiver na lista, mas for um subdomínio do vercel.app, permite (opcional, mas útil para previews)
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// Importa as rotas
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const debugRoutes = require('./routes/debug');

// Configuração de rotas flexível (para funcionar com ou sem rewrite do Vercel)
const router = express.Router();
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/user', userRoutes);
router.use('/debug', debugRoutes);

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
