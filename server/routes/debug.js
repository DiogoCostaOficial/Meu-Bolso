const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
require('dotenv').config();

router.get('/test-email', async (req, res) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.verify();

        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'Teste de Debug - Finanças Fácil',
            text: 'Se você recebeu isso, o envio de e-mail está funcionando!',
            html: '<h1>Teste de Debug</h1><p>Se você recebeu isso, o envio de e-mail está funcionando!</p>'
        });

        res.json({
            success: true,
            message: 'E-mail enviado com sucesso!',
            info: info,
            config: {
                user: process.env.EMAIL_USER,
                passConfigured: !!process.env.EMAIL_PASS
            }
        });

    } catch (error) {
        console.error('Erro no teste de email:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao enviar e-mail',
            error: {
                message: error.message,
                code: error.code,
                response: error.response,
                command: error.command
            },
            config: {
                user: process.env.EMAIL_USER,
                passConfigured: !!process.env.EMAIL_PASS
            }
        });
    }
});

module.exports = router;
