// server/utils/email.js
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuração do transportador de e-mail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Envia código OTP para validação de conta
const enviarCodigoOTP = async (email, nome, codigo) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Código de Verificação - Meu Bolso 🔐',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px;
            padding: 40px;
            text-align: center;
          }
          .logo {
            background-color: white;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
          }
          h1 {
            color: white;
            margin-bottom: 10px;
            font-size: 28px;
          }
          .subtitle {
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 30px;
            font-size: 16px;
          }
          .otp-box {
            background-color: white;
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          }
          .otp-code {
            font-size: 48px;
            font-weight: bold;
            color: #667eea;
            letter-spacing: 12px;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
          }
          .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: left;
          }
          .warning-icon {
            color: #f59e0b;
            font-weight: bold;
            font-size: 18px;
          }
          .footer {
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
            margin-top: 30px;
          }
          .info-box {
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 15px;
            margin-top: 20px;
            color: white;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">🔐</div>
          <h1>Olá, ${nome}!</h1>
          <p class="subtitle">Bem-vindo ao Meu Bolso</p>

          <div class="otp-box">
            <p style="color: #666; margin-bottom: 10px;">Seu código de verificação é:</p>
            <div class="otp-code">${codigo}</div>
            <p style="color: #999; font-size: 14px; margin-top: 10px;">
              Digite este código para ativar sua conta
            </p>
          </div>

          <div class="warning">
            <p style="margin: 0;">
              <span class="warning-icon">⚠️</span>
              <strong>Importante:</strong> Este código expira em <strong>10 minutos</strong> e pode ser usado apenas uma vez.
            </p>
          </div>

          <div class="info-box">
            <p style="margin: 5px 0;">✅ Válido por 10 minutos</p>
            <p style="margin: 5px 0;">🔒 Mantenha este código em segurança</p>
            <p style="margin: 5px 0;">🚫 Nunca compartilhe com ninguém</p>
          </div>

          <div class="footer">
            <p>Se você não solicitou este código, ignore este e-mail.</p>
            <p style="margin-top: 20px;">
              <strong>Equipe Meu Bolso</strong><br>
              Controle financeiro inteligente
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  // Verifica se as credenciais de e-mail estão configuradas
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ Credenciais de e-mail não configuradas. O e-mail não será enviado.');
    console.log(`🔑 CÓDIGO OTP (SIMULADO): ${codigo}`);
    return { success: true };
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Código OTP enviado para ${email}`);
    console.log(`🔑 CÓDIGO OTP (DEBUG): ${codigo}`); // Log do código para testes
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao enviar código OTP:', error);
    // Em ambiente de desenvolvimento, vamos considerar sucesso mesmo se falhar o envio
    // para permitir testar o fluxo
    console.log(`🔑 CÓDIGO OTP (FALLBACK): ${codigo}`);
    return { success: true, error: error.message };
  }
};

// Envia e-mail de boas-vindas (após validação OTP)
const enviarEmailBoasVindas = async (email, nome) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Bem-vindo ao Meu Bolso! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
          }
          .content {
            padding: 30px 20px;
          }
          .feature {
            background-color: #f8f9fa;
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            border-left: 4px solid #667eea;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Conta Ativada com Sucesso!</h1>
          <p>Olá, ${nome}!</p>
        </div>

        <div class="content">
          <p>Parabéns! Sua conta no <strong>Meu Bolso</strong> foi ativada e você já pode começar a usar.</p>

          <h3>🚀 O que você pode fazer agora:</h3>

          <div class="feature">
            <strong>📊 Dashboard Completo</strong><br>
            Visualize todas as suas finanças em um só lugar
          </div>

          <div class="feature">
            <strong>💰 Controle de Receitas</strong><br>
            Registre todas as suas fontes de renda
          </div>

          <div class="feature">
            <strong>💳 Gestão de Despesas</strong><br>
            Categorize e monitore todos os seus gastos
          </div>

          <div class="feature">
            <strong>📈 Relatórios Detalhados</strong><br>
            Gráficos e análises para tomar melhores decisões
          </div>

          <div class="feature">
            <strong>🎯 Metas e Orçamento</strong><br>
            Defina objetivos e acompanhe seu progresso
          </div>

          <div style="text-align: center;">
            <a href="http://localhost:5173/dashboard" class="cta-button">
              Acessar Meu Dashboard
            </a>
          </div>

          <p style="margin-top: 30px;">
            Se tiver alguma dúvida ou precisar de ajuda, estamos aqui para você!
          </p>
        </div>

        <div class="footer">
          <p>
            <strong>Meu Bolso</strong><br>
            Controle financeiro inteligente para você e sua família
          </p>
          <p style="font-size: 12px; color: #999;">
            Este é um e-mail automático, por favor não responda.
          </p>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ E-mail de boas-vindas enviado para ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail de boas-vindas:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  enviarCodigoOTP,
  enviarEmailBoasVindas
};
