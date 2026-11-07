// server/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken } = require('../middleware/auth');
const { authLimiter, otpLimiter } = require('../middleware/security');

// Rotas públicas (não precisam de autenticação)
router.post('/registrar', authLimiter, authController.registrar);
router.post('/login', authLimiter, authController.login);
router.post('/google', authLimiter, authController.googleLogin);
router.post('/outlook-otp', otpLimiter, authController.outlookLoginOTP);
router.post('/validar-otp', otpLimiter, authController.validarOTP);
router.post('/reenviar-otp', otpLimiter, authController.reenviarOTP);
router.post('/solicitar-recuperacao', otpLimiter, authController.solicitarRecuperacaoSenha);
router.post('/redefinir-senha', otpLimiter, authController.redefinirSenha);

// Rotas protegidas (precisam de token JWT)
router.post('/alterar-senha', verificarToken, authController.alterarSenha);

// Exporta o router corretamente
module.exports = router;
