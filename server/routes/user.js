const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verificarToken } = require('../middleware/auth');

router.get('/perfil', verificarToken, userController.obterPerfil);
router.get('/dados', verificarToken, userController.obterDados);
router.post('/dados', verificarToken, userController.salvarDados);

module.exports = router;
