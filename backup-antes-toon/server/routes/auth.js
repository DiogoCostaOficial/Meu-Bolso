// server/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken } = require('../middleware/auth');

// Rotas públicas (não precisam de autenticação)
router.post('/registrar', authController.registrar);
router.post('/login', authController.login);
router.post('/validar-otp', authController.validarOTP);
router.post('/reenviar-otp', authController.reenviarOTP);

// Rotas protegidas (precisam de token JWT)
router.post('/alterar-senha', verificarToken, authController.alterarSenha);

// Exporta o router corretamente
module.exports = router;
