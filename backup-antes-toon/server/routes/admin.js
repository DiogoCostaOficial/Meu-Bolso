const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

router.get('/estatisticas', verificarToken, verificarAdmin, adminController.obterEstatisticas);
router.get('/usuarios', verificarToken, verificarAdmin, adminController.listarTodosUsuarios);
router.get('/usuarios/:id', verificarToken, verificarAdmin, adminController.buscarUsuarioPorId);
router.put('/usuarios/:id', verificarToken, verificarAdmin, adminController.atualizarUsuario);
router.delete('/usuarios/:id', verificarToken, verificarAdmin, adminController.deletarUsuario);

module.exports = router;
