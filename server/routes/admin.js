const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

// Estatísticas e Usuários (Prioridade 1 & 2)
router.get('/estatisticas', verificarToken, verificarAdmin, adminController.obterEstatisticas);
router.get('/usuarios', verificarToken, verificarAdmin, adminController.listarTodosUsuarios);
router.get('/usuarios/:id', verificarToken, verificarAdmin, adminController.buscarUsuarioPorId);
router.post('/usuarios', verificarToken, verificarAdmin, adminController.criarUsuario);
router.put('/usuarios/:id', verificarToken, verificarAdmin, adminController.atualizarUsuario);
router.patch('/usuarios/:id/status', verificarToken, verificarAdmin, adminController.alternarStatusUsuario);
router.delete('/usuarios/:id', verificarToken, verificarAdmin, adminController.deletarUsuario);

// Feedbacks de Usuários (Prioridade 4)
router.get('/feedbacks', verificarToken, verificarAdmin, adminController.listarFeedbacks);
router.post('/feedbacks', verificarToken, verificarAdmin, adminController.adicionarFeedback);

// Backlog do PM e Hipóteses (Prioridade 7)
router.get('/backlog', verificarToken, verificarAdmin, adminController.listarBacklogPM);
router.post('/backlog', verificarToken, verificarAdmin, adminController.adicionarBacklogPM);
router.put('/backlog/:id', verificarToken, verificarAdmin, adminController.atualizarBacklogPM);

module.exports = router;
