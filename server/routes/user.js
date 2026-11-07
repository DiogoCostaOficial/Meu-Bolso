const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const lgpdController = require('../controllers/lgpdController');
const { verificarToken } = require('../middleware/auth');
const { generateManualVideoWithGemini, listExistingManualVideos } = require('../utils/geminiVideoGenerator');
const { synthesizeFullNarrationMp3 } = require('../utils/finChildTts');
const { enviarSugestaoContato } = require('../utils/email');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do Multer para Memória (Supabase Storage)
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas imagens são permitidas!'));
        }
    }
});

router.get('/perfil', verificarToken, userController.obterPerfil);
router.put('/perfil', verificarToken, userController.atualizarPerfil);
router.delete('/conta', verificarToken, userController.excluirConta);
router.delete('/perfil', verificarToken, userController.excluirConta);
router.post('/upload-avatar', verificarToken, upload.single('avatar'), userController.uploadAvatar);
// LGPD: direitos do titular (art. 18)
router.get('/lgpd/status', verificarToken, lgpdController.status);
router.post('/lgpd/aceite', verificarToken, lgpdController.aceitarTermos);
router.post('/lgpd/consentimento', verificarToken, lgpdController.definirConsentimento);
router.get('/lgpd/meus-dados', verificarToken, lgpdController.exportarMeusDados);

router.get('/dados', verificarToken, userController.obterDados);
router.post('/dados', verificarToken, userController.salvarDados);

// Rotas incrementais para transações individuais (Performance com Supabase / Optimistic UI)
router.post('/transactions', verificarToken, userController.adicionarTransacao);
router.put('/transactions/:id', verificarToken, userController.atualizarTransacao);
router.delete('/transactions/:id', verificarToken, userController.deletarTransacao);

// Rotas do Gerador de Vídeos Curtos do Manual via Google Gemini (gemini-3.8-flash + gemini-omni-1.1-flash)
router.get('/fin-video/status', verificarToken, (req, res) => {
    try {
        const availableMp4Ids = listExistingManualVideos();
        res.json({
            sucesso: true,
            hasServerApiKey: Boolean(process.env.GEMINI_API_KEY),
            availableMp4Ids
        });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

router.post('/fin-video/generate', verificarToken, async (req, res) => {
    try {
        const { topicId = 'orcamento', language = 'pt-BR', apiKey } = req.body || {};
        const result = await generateManualVideoWithGemini({ topicId, language, apiKey });
        res.json({
            sucesso: true,
            ...result
        });
    } catch (err) {
        console.error('Erro ao gerar vídeo curto do Manual via Gemini:', err);
        res.status(400).json({
            sucesso: false,
            erro: err.message || 'Erro ao gerar vídeo via Google Gemini API.'
        });
    }
});

// Rota de Voz Neural Infantil Contínua do FIN (Sem Cortes - Retorna os chunks MP3 completos da cena)
router.post('/fin-video/tts', verificarToken, async (req, res) => {
    try {
        const { text, language = 'pt-BR' } = req.body || {};
        const result = await synthesizeFullNarrationMp3({ text, language });
        return res.json({
            sucesso: true,
            audioChunks: result.audioChunks,
            textChunks: result.textChunks
        });
    } catch (err) {
        console.error('Erro ao sintetizar voz neural do FIN:', err);
        return res.status(500).json({
            sucesso: false,
            erro: err.message || 'Erro ao sintetizar voz neural do FIN.'
        });
    }
});

// Rota para envio de sugestões/contato diretamente para financasfacil10@gmail.com
router.post('/sugestao', verificarToken, async (req, res) => {
    try {
        const { assunto, mensagem } = req.body || {};
        if (!mensagem || !String(mensagem).trim()) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Por favor, escreva sua sugestão ou mensagem.'
            });
        }
        const nomeUsuario = req.usuario?.nome || req.body?.nome || 'Usuário';
        const emailUsuario = req.usuario?.email || req.body?.email || '';

        const resultado = await enviarSugestaoContato({
            nomeUsuario,
            emailUsuario,
            assunto,
            mensagem
        });

        if (resultado.success) {
            return res.json({
                sucesso: true,
                mensagem: 'Sua sugestão foi enviada com sucesso para financasfacil10@gmail.com!'
            });
        }

        return res.json({
            sucesso: false,
            fallbackMailto: true,
            erro: resultado.error || 'Não foi possível enviar automaticamente pelo servidor.'
        });
    } catch (err) {
        console.error('Erro na rota de sugestão:', err);
        return res.status(500).json({
            sucesso: false,
            fallbackMailto: true,
            erro: err.message
        });
    }
});

module.exports = router;
