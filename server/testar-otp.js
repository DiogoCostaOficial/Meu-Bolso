// Script para testar o envio de OTP específico do sistema
const { enviarCodigoOTP } = require('./utils/email');

async function testarOTP() {
  console.log('🧪 Testando envio de OTP específico...');
  
  try {
    const resultado = await enviarCodigoOTP(
      'financasfacil10@gmail.com', // e-mail do destinatário
      'Usuário Teste', // nome
      '123456' // código OTP
    );
    
    console.log('✅ Resultado:', resultado);
    
    if (resultado.success) {
      console.log('🎉 E-mail OTP enviado com sucesso!');
    } else {
      console.log('❌ Falha no envio:', resultado.error);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar OTP:', error);
  }
}

testarOTP();