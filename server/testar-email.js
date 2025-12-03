// Script para testar conexão SMTP e envio de e-mail
const nodemailer = require('nodemailer');
require('dotenv').config();

async function testarEmail() {
  console.log('🧪 Iniciando teste de e-mail...');
  console.log('📧 E-mail configurado:', process.env.EMAIL_USER);

  // Configuração do transportador
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    debug: false,
    logger: false
  });

  try {
    console.log('🔍 Verificando conexão...');

    // Testa a conexão
    await transporter.verify();
    console.log('✅ Conexão SMTP estabelecida com sucesso!');

    // Tenta enviar um e-mail de teste
    console.log('📤 Enviando e-mail de teste...');

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Envia para o próprio e-mail
      subject: 'Teste de E-mail - Finanças Fácil',
      text: 'Este é um e-mail de teste para verificar se a configuração está funcionando.',
      html: '<h1>Teste de E-mail</h1><p>Este é um e-mail de teste para verificar se a configuração está funcionando.</p>'
    });

    console.log('✅ E-mail enviado com sucesso!');
    console.log('📨 ID da mensagem:', info.messageId);

  } catch (error) {
    console.error('❌ Erro ao testar e-mail:');
    console.error('Erro completo:', error);

    if (error.code === 'EAUTH') {
      console.error('\n🔒 Problema de autenticação!');
      console.error('Verifique se a senha de app está correta.');
    }
  } finally {
    transporter.close();
  }
}

// Executa o teste
testarEmail().catch(console.error);