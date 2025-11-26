const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verificarToken } = require('../middleware/auth');

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
router.post('/upload-avatar', verificarToken, upload.single('avatar'), userController.uploadAvatar);
router.get('/dados', verificarToken, userController.obterDados);
router.post('/dados', verificarToken, userController.salvarDados);

module.exports = router;
